const WalletIcon = ({ className = "w-16 h-16" }: { className?: string }) => {
  return (
    <div className={`${className} bg-primary rounded-2xl flex items-center justify-center shadow-lg`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-10 h-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 7V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V7"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="17" cy="13.5" r="1.5" fill="white" />
      </svg>
    </div>
  );
};

export default WalletIcon;
