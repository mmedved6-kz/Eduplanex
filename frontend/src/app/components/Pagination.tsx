interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const renderPageNumbers = () => {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
          pages.push(
            <button
              key={i}
              className={`px-2 rounded-sm ${
                currentPage === i ? 'bg-blue-50' : ''
              }`}
              onClick={() => onPageChange(i)}
            >
              {i}
            </button>
          );
        } else if (i === currentPage - 2 || i === currentPage + 2) {
          pages.push(<span key={i}>...</span>);
        }
      }
      return pages;
    };
  
    return (
      <div className="p-4 flex items-center justify-between text-gray-500">
        <button
          className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <div className="flex items-center gap-2 text-sm">
          {renderPageNumbers()}
        </div>
        <button
          className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };
  
  export default Pagination;