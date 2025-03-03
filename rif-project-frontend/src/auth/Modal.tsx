import React from "react";

const Modal: React.FC<React.PropsWithChildren<{ onClose: () => void }>> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white p-6 rounded-lg shadow-lg z-10 max-w-md w-full mx-auto">
        <div className="max-h-96 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
