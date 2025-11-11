import React from 'react';
import { CalculationResult, AffordabilityStatus, CheckResult } from '../types';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from './Icon';
// Fix: Import missing constants from constants.ts
import {
    DISPOSABLE_INCOME_BUFFER,
    MAX_DTI_RATIO,
    MAX_TCO_RATIO,
    WARN_DTI_RATIO,
    WARN_TCO_RATIO
} from '../constants';

interface ResultsDisplayProps {
    results: CalculationResult;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
};

const StatusBanner: React.FC<{ status: AffordabilityStatus }> = ({ status }) => {
    const statusConfig = {
        [AffordabilityStatus.APPROVED]: {
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-400',
            textColor: 'text-green-300',
            title: 'Approved',
            message: 'Based on the provided information, your application is likely to be approved.',
        },
        [AffordabilityStatus.APPROVED_WITH_CONDITIONS]: {
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-400',
            textColor: 'text-yellow-300',
            title: 'Approved with Conditions',
            message: 'Your application is on the borderline. Approval may be possible but could require further review or conditions.',
        },
        [AffordabilityStatus.NOT_APPROVED]: {
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-400',
            textColor: 'text-red-300',
            title: 'Not Approved',
            message: 'Based on the provided information, your application is unlikely to be approved.',
        },
        [AffordabilityStatus.PENDING]: {
            bgColor: 'bg-gray-700/20',
            borderColor: 'border-gray-600',
            textColor: 'text-gray-400',
            title: 'Enter Your Details',
            message: 'Complete the form to see your estimated vehicle finance affordability.',
        },
    };

    const config = statusConfig[status];

    return (
        <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
            <h3 className={`text-xl font-bold ${config.textColor}`}>{config.title}</h3>
            <p className="text-sm text-gray-300 mt-1">{config.message}</p>
        </div>
    );
};

const MetricCard: React.FC<{ title: string; value: string; subtext?: string, className?: string }> = ({ title, value, subtext, className }) => (
    <div className={`bg-gray-800/60 p-4 rounded-lg border border-gray-700 ${className}`}>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
);

const ReasoningItem: React.FC<{ check: CheckResult }> = ({ check }) => (
    <li className="flex items-start space-x-3 py-2 border-b border-gray-700/50 last:border-b-0">
        {check.pass ? (
            <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
        ) : (
            <XCircleIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
            <p className="font-medium text-white">{check.message}</p>
            <p className={`text-sm ${check.pass ? 'text-gray-400' : 'text-red-300'}`}>
                Your value: <span className="font-semibold">{check.value}</span> | Required: <span className="font-semibold">{check.limit}</span>
            </p>
        </div>
    </li>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
    if (!results.isCalculated) {
        return (
            <div className="sticky top-6">
                <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700">
                     <StatusBanner status={AffordabilityStatus.PENDING} />
                </div>
            </div>
        );
    }
    
    const { 
        status, maxLoanAmount, monthlyInstallment, totalMonthlyCost, interestRate,
        dtiRatio, tcoRatio, disposableIncome, reasoning, warnings 
    } = results;

    const getDtiColorClass = (ratio: number) => {
        if (ratio > MAX_DTI_RATIO) return 'text-red-400';
        if (ratio > WARN_DTI_RATIO) return 'text-yellow-400';
        return 'text-green-400';
    }

    const getTcoColorClass = (ratio: number) => {
        if (ratio > MAX_TCO_RATIO) return 'text-red-400';
        if (ratio > WARN_TCO_RATIO) return 'text-yellow-400';
        return 'text-green-400';
    }

    const getDiColorClass = (income: number) => {
        if (income < DISPOSABLE_INCOME_BUFFER) return 'text-red-400';
        return 'text-green-400';
    }

    return (
         <div className="sticky top-6 space-y-8">
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700">
                <StatusBanner status={status} />

                {status !== AffordabilityStatus.PENDING && (
                    <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <MetricCard 
                                title="Estimated Monthly Installment"
                                value={formatCurrency(monthlyInstallment)}
                                subtext={`at ${interestRate.toFixed(2)}% interest rate`}
                            />
                             <MetricCard 
                                title="Total Monthly Vehicle Cost"
                                value={formatCurrency(totalMonthlyCost)}
                                subtext="Installment + running costs"
                            />
                        </div>
                        <MetricCard 
                            title="Maximum Affordable Loan"
                            value={formatCurrency(maxLoanAmount)}
                            subtext="Based on your overall financial profile"
                            className="bg-cyan-900/20 border-cyan-700"
                        />
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <MetricCard title="Debt-to-Income" value={`${dtiRatio.toFixed(1)}%`} subtext="Limit: < 40%" className={getDtiColorClass(dtiRatio)} />
                             <MetricCard title="Cost of Ownership" value={`${tcoRatio.toFixed(1)}%`} subtext="Limit: < 25%" className={getTcoColorClass(tcoRatio)} />
                             <MetricCard title="Disposable Income" value={formatCurrency(disposableIncome)} subtext="Buffer: > R2,500" className={getDiColorClass(disposableIncome)} />
                        </div>
                    </div>
                )}
            </div>

            {reasoning.length > 0 && (
                 <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Affordability Breakdown</h3>
                    <ul>
                        {reasoning.map((check, index) => <ReasoningItem key={index} check={check} />)}
                    </ul>
                 </div>
            )}
            
            {warnings.length > 0 && (
                <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Actionable Advice & Warnings</h3>
                    <ul className="space-y-3">
                        {warnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-3 text-yellow-300">
                                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-400" />
                                <span className="text-sm">{warning}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};