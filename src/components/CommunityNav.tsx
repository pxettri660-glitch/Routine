import React from 'react';
import CommunityLayout from './community/CommunityLayout';

interface Props {
  onNavigate: (view: string) => void;
}

const CommunityNav: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="h-[calc(100vh-80px)] w-full">
      <CommunityLayout onNavigate={onNavigate} />
    </div>
  );
};

export default CommunityNav;
