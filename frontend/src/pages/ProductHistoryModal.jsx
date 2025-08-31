import { useState, useEffect } from 'react';
import { FaHistory, FaTimes, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductHistoryModal = ({ productId, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen && productId) {
      fetchHistory();
    }
  }, [isOpen, productId, currentPage]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/products/${productId}/history`, {
        params: { page: currentPage }
      });
      
      setHistory(response.data.history);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load product history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Stock History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : (
            <>
              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Previous Stock</th>
                        <th className="px-4 py-2 text-left">New Stock</th>
                        <th className="px-4 py-2 text-left">Change</th>
                        <th className="px-4 py-2 text-left">Changed By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry, index) => (
                        <tr key={entry._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-2">
                            {new Date(entry.changeDate).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">{entry.oldStock}</td>
                          <td className="px-4 py-2">{entry.newStock}</td>
                          <td className="px-4 py-2">
                            <span className={entry.newStock > entry.oldStock ? 'text-green-600' : 'text-red-600'}>
                              {entry.newStock > entry.oldStock ? '+' : ''}{entry.newStock - entry.oldStock}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {entry.userId?.name || 'System'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No history available for this product
                </div>
              )}
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 mx-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 mx-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductHistoryModal;