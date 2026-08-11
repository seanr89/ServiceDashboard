import React from 'react';
import { LocalFileReviewer } from '../components/LocalFileReviewer';

interface FileReviewViewProps {
  onRefresh?: () => void;
}

export const FileReviewView: React.FC<FileReviewViewProps> = ({ onRefresh }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <LocalFileReviewer onRefresh={onRefresh} />
    </div>
  );
};
