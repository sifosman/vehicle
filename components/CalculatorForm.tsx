import React from 'react';
import { FormData, CreditScore, EmploymentStatus } from '../types';
import { LOAN_TERMS, BALLOON_PERCENTAGES } from '../constants';
import { InputGroup, SelectGroup } from './FormControls';
import { RefreshIcon } from './Icon';

interface CalculatorFormProps {
    formData: FormData;
    onFormChange: (field: keyof FormData, value: any) => void;
    onReset: () => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ formData, onFormChange, onReset }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : type === 'radio' ? (value === 'true') : parseFloat(value) || 0;
        onFormChange(name as keyof FormData, fieldValue);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFormChange(name as keyof FormData, value);
    };

    return (
        <form className="space-y-8 bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Your Financial Details</h2>
                <button type="button" onClick={onReset} className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    <RefreshIcon className="w-4 h-4" />
                    <span>Reset</span>
                </button>
            </div>
            
            {/* Personal & Income Details */}
            <fieldset className="space-y-4 border-t border-gray-700 pt-6">
                <legend className="text-lg font-semibold text-cyan-400 mb-2">Personal & Income</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Gross Monthly Income (ZAR)" name="grossIncome" type="number" value={formData.grossIncome} onChange={handleInputChange} />
                    <InputGroup label="Net Monthly Take-home (ZAR)" name="netIncome" type="number" value={formData.netIncome} onChange={handleInputChange} />
                </div>

                <div className="pt-2">
                     <h4 className="text-sm font-medium text-gray-300">Other Income (e.g., Freelance)</h4>
                     <p className="text-xs text-gray-500 mb-3">Enter income from the last 3 months. An average will be added to your gross income for calculations.</p>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <InputGroup label="Past Month 1" name="freelanceIncomeMonth1" type="number" value={formData.freelanceIncomeMonth1} onChange={handleInputChange} />
                         <InputGroup label="Past Month 2" name="freelanceIncomeMonth2" type="number" value={formData.freelanceIncomeMonth2} onChange={handleInputChange} />
                         <InputGroup label="Past Month 3" name="freelanceIncomeMonth3" type="number" value={formData.freelanceIncomeMonth3} onChange={handleInputChange} />
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <SelectGroup label="Employment Status" name="employmentStatus" value={formData.employmentStatus} onChange={handleSelectChange} options={Object.values(EmploymentStatus)} />
                    <InputGroup label="Employment Length (Months)" name="employmentLength" type="number" value={formData.employmentLength} onChange={handleInputChange} />
                    <InputGroup label="Applicant Age" name="applicantAge" type="number" value={formData.applicantAge} onChange={handleInputChange} />
                </div>
            </fieldset>

            {/* Existing Financial Commitments */}
            <fieldset className="space-y-4 border-t border-gray-700 pt-6">
                <legend className="text-lg font-semibold text-cyan-400 mb-2">Existing Commitments</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <InputGroup label="Total Monthly Debt Repayments" name="debtRepayments" type="number" value={formData.debtRepayments} onChange={handleInputChange} />
                     <InputGroup label="Monthly Rent/Mortgage" name="rentMortgage" type="number" value={formData.rentMortgage} onChange={handleInputChange} />
                     <InputGroup label="Number of Financial Dependents" name="dependents" type="number" value={formData.dependents} onChange={handleInputChange} />
                </div>
            </fieldset>
            
            {/* Credit Profile */}
            <fieldset className="space-y-4 border-t border-gray-700 pt-6">
                <legend className="text-lg font-semibold text-cyan-400 mb-2">Credit Profile</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <SelectGroup label="Estimated Credit Score" name="creditScore" value={formData.creditScore} onChange={handleSelectChange} options={Object.values(CreditScore)} />
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Adverse Credit Record?</label>
                        <div className="flex items-center space-x-4 bg-gray-900 border border-gray-600 rounded-md p-2">
                            <label className="flex items-center space-x-2 cursor-pointer w-1/2 justify-center">
                                <input type="radio" name="adverseRecord" value="false" checked={!formData.adverseRecord} onChange={handleInputChange} className="form-radio h-4 w-4 text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                                <span>No</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer w-1/2 justify-center">
                                <input type="radio" name="adverseRecord" value="true" checked={formData.adverseRecord} onChange={handleInputChange} className="form-radio h-4 w-4 text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                                <span>Yes</span>
                            </label>
                        </div>
                    </div>
                </div>
            </fieldset>

            {/* Vehicle Purchase Details */}
             <fieldset className="space-y-4 border-t border-gray-700 pt-6">
                <legend className="text-lg font-semibold text-cyan-400 mb-2">Vehicle Purchase</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Vehicle Purchase Price (ZAR)" name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleInputChange} />
                    <InputGroup label="Deposit Amount (ZAR)" name="deposit" type="number" value={formData.deposit} onChange={handleInputChange} />
                    <InputGroup label="Vehicle Manufacturing Year" name="vehicleYear" type="number" value={formData.vehicleYear} onChange={handleInputChange} />
                    <SelectGroup label="Loan Term (Months)" name="loanTerm" value={formData.loanTerm} onChange={handleSelectChange} options={LOAN_TERMS} />
                    <SelectGroup label="Balloon/Residual Payment" name="balloonPercentage" value={formData.balloonPercentage} onChange={handleSelectChange} options={BALLOON_PERCENTAGES.map(p => `${p}%`)} displayMapping={(val) => parseInt(val)} />
                </div>
            </fieldset>

            {/* Vehicle Running Costs */}
            <fieldset className="space-y-4 border-t border-gray-700 pt-6">
                <legend className="text-lg font-semibold text-cyan-400 mb-2">Estimated Monthly Running Costs</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputGroup label="Insurance" name="insurance" type="number" value={formData.insurance} onChange={handleInputChange} />
                    <InputGroup label="Fuel" name="fuel" type="number" value={formData.fuel} onChange={handleInputChange} />
                    <InputGroup label="Maintenance" name="maintenance" type="number" value={formData.maintenance} onChange={handleInputChange} />
                </div>
            </fieldset>
        </form>
    );
};
