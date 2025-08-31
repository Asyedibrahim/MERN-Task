import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    oldStock: {
        type: Number,
        required: true
    },
    newStock: {
        type: Number,
        required: true
    },
    changeDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

historySchema.index({ productId: 1, changeDate: -1 });

export default mongoose.model('History', historySchema);