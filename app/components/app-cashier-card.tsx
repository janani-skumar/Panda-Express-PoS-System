import React from "react";

const CashierCard = (props: {
    name: string,
    key?: number
    className?: string
}) => {
  return (
    <div
        className={`
            aspect-square 
            bg-tamu-maroon 
            hover:bg-tamu-maroon-dark 
            active:scale-95
            transition-all 
            duration-200 
            rounded-lg 
            shadow-md 
            hover:shadow-lg
            flex 
            items-center 
            justify-center 
            p-6
            cursor-pointer
            border-2
            border-transparent
            hover:border-tamu-maroon-light
            ${props.className || ''}
        `}
    >
        <h3 className="text-white text-xl font-bold text-center leading-tight">
            {props.name}
        </h3>
    </div>
  );
};

export default CashierCard;