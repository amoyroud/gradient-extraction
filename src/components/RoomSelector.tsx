import React from 'react';

export type RoomType = 'livingRoom' | 'bedroom' | 'office' | 'diningRoom';

interface RoomSelectorProps {
  selectedRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ 
  selectedRoom, 
  onSelectRoom 
}) => {
  const rooms: RoomType[] = ['livingRoom', 'bedroom', 'office', 'diningRoom'];
  
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {rooms.map((room) => (
        <button
          key={room}
          onClick={() => onSelectRoom(room)}
          className={`px-3 py-1.5 rounded transition ${
            selectedRoom === room 
              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}
        >
          {room.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        </button>
      ))}
    </div>
  );
};

export default RoomSelector; 