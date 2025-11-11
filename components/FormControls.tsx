
import React from 'react';

interface InputGroupProps {
    label: string;
    name: string;
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, name, type, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        />
    </div>
);

interface SelectGroupProps {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: (string | number)[];
    displayMapping?: (val: string | number) => string | number;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({ label, name, value, onChange, options, displayMapping }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        >
            {options.map(option => (
                <option key={option} value={displayMapping ? displayMapping(option) : option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);
