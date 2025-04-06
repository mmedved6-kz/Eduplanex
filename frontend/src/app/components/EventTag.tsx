type EventTagProps = {
    tag: string; // 'CLASS', 'EXAM', 'MEETING', or 'EVENT'
  };
  
  const EventTag = ({ tag }: EventTagProps) => {
    // Define colors for different event types
    const getTagColor = () => {
      switch (tag.toUpperCase()) {
        case 'CLASS':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'EXAM':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'MEETING':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'EVENT':
          return 'bg-green-100 text-green-800 border-green-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };
  
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${getTagColor()}`}>
        {tag || 'Unknown'}
      </span>
    );
  };

  export default EventTag;