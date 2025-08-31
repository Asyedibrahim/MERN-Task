import Product from '../models/product.model.js';
import History from '../models/history.model.js';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { Parser } from 'json2csv';

const createHistoryEntry = async (productId, oldStock, newStock) => {
    if (oldStock !== newStock) {
        await History.create({
            productId,
            oldStock,
            newStock
        });
    }
};

export const importProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
        }

        const products = [];
        const stream = Readable.from(req.file.buffer.toString());

        stream
        .pipe(csv())
        .on('data', (row) => {
            products.push(row);
        })
        .on('end', async () => {
            let added = 0, skipped = 0;
            const duplicates = [];

            for (const item of products) {
                
                const exists = await Product.findOne({ name: item.name });
                
                if (exists) {
                    const oldStock = exists.stock;
                    const newStock = parseInt(item.stock) || exists.stock || 0;
                    
                    // Create history entry if stock changed
                    if (oldStock !== newStock) {
                        await createHistoryEntry(exists._id, oldStock, newStock);
                    }
                    
                    skipped++;
                    duplicates.push({
                        _id: exists._id,
                        name: item.name,
                        unit: item.unit || exists.unit,
                        category: item.category || exists.category,
                        brand: item.brand || exists.brand,
                        stock: newStock,
                        status: item.status || exists.status || (newStock > 0 ? "In Stock" : "Out of Stock"),
                        image: item.image || exists.image
                    });
                    continue;
                }

                const newProduct = new Product({
                    name: item.name,
                    unit: item.unit,
                    category: item.category,
                    brand: item.brand,
                    stock: parseInt(item.stock) || 0,
                    status: item.status || (parseInt(item.stock) > 0 ? "In Stock" : "Out of Stock"),
                    image: item.image
                });

                await newProduct.save();
                
                // Create history entry for new product
                await createHistoryEntry(newProduct._id, 0, newProduct.stock);

                added++;
            }

            res.status(200).json({ 
                success: true, 
                added, 
                skipped,
                duplicates: duplicates.length > 0 ? duplicates : undefined
            });
        });
    } catch (err) {
        console.error("Import error:", err);
        res.status(500).json({ success: false, message: 'Failed to import products' });
    }
};

export const updateMultipleProducts = async (req, res) => {
    try {
        const { products } = req.body;
        let updated = 0;
        let failed = 0;

        for (const productData of products) {
            try {
                const existingProduct = await Product.findById(productData._id);
                
                if (!existingProduct) {
                    failed++;
                    continue;
                }
                
                const oldStock = existingProduct.stock;
                const updatedProduct = await Product.findByIdAndUpdate(
                    productData._id,
                    productData,
                    { new: true, runValidators: true }
                );
                
                if (updatedProduct) {
                    // Create history entry if stock changed
                    await createHistoryEntry(
                        productData._id, 
                        oldStock, 
                        updatedProduct.stock
                    );
                    updated++;
                } else {
                    failed++;
                }
            } catch (error) {
                console.error(`Error updating product ${productData._id}:`, error);
                failed++;
            }
        }

        res.status(200).json({ 
            success: true, 
            updated, 
            failed 
        });
    } catch (err) {
        console.error("Bulk update error:", err);
        res.status(500).json({ success: false, message: 'Failed to update products' });
    }
};

// Add this new function to get product history
export const getProductHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // Validate product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const [history, total] = await Promise.all([
            History.find({ productId: id })
                .sort({ changeDate: -1 })
                .skip(skip)
                .limit(limit),
            History.countDocuments({ productId: id })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            history,
            currentPage: page,
            totalPages,
            totalEntries: total,
            product: {
                name: product.name,
                currentStock: product.stock
            }
        });
    } catch (err) {
        console.error("History fetch error:", err);
        res.status(500).json({ error: 'Failed to fetch product history' });
    }
};

export const exportProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        const fields = ["name", "unit", "category", "brand", "stock", "status", "image"];
        const parser = new Parser({ fields });
        const csvData = parser.parse(products);

        res.header('Content-Type', 'text/csv');
        res.attachment('products.csv');
        return res.send(csvData);
    } catch (err) {
        console.error("Export error:", err);
        res.status(500).json({ success: false, message: 'Failed to export products' });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 30;
        const skip = (page - 1) * limit;
        
        const searchQuery = req.query.search || '';
        const categoryQuery = req.query.category || '';
        
        const query = {};
        
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { brand: { $regex: searchQuery, $options: 'i' } },
            ];
        }
        
        if (categoryQuery) {
            query.category = categoryQuery;
        }

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            products,
            currentPage: page,
            totalPages,
            totalProducts: total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json({ categories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const oldStock = existingProduct.stock;
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        await createHistoryEntry(id, oldStock, updatedProduct.stock);
        
        res.json(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};