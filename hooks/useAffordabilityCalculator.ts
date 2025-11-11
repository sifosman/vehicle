import { useMemo } from 'react';
import { FormData, CalculationResult, AffordabilityStatus, CheckResult, CreditScore, EmploymentStatus } from '../types';
import { 
    INTEREST_RATE_MAP, 
    MAX_DTI_RATIO,
    WARN_DTI_RATIO, 
    DISPOSABLE_INCOME_BUFFER, 
    MAX_TCO_RATIO,
    WARN_TCO_RATIO,
    INITIAL_CALCULATION_RESULT,
    MIN_APPLICANT_AGE,
    MAX_APPLICANT_AGE,
    MAX_VEHICLE_AGE_AT_END,
    MIN_NON_PERMANENT_EMPLOYMENT_MONTHS,
    LIVING_EXPENSE_PER_DEPENDENT
} from '../constants';

const calculateMonthlyInstallment = (
    principal: number,
    annualInterestRate: number,
    termInMonths: number,
    balloonAmount: number = 0
): number => {
    if (principal <= 0) return 0;
    if (annualInterestRate <= 0 || termInMonths <= 0) return principal / termInMonths;
    
    const monthlyRate = (annualInterestRate / 100) / 12;

    if (monthlyRate === 0) return (principal - balloonAmount) / termInMonths;
    
    const n = termInMonths;
    const r = monthlyRate;
    const P = principal;
    const FV = balloonAmount;

    // Standard formula for loan with balloon payment
    const numerator = (P - (FV / Math.pow(1 + r, n))) * r;
    const denominator = 1 - Math.pow(1 + r, -n);

    if (denominator === 0) return 0;

    return numerator / denominator;
};

const calculateMaxLoanPrincipal = (
    maxInstallment: number,
    annualInterestRate: number,
    termInMonths: number
): number => {
    if (maxInstallment <= 0 || annualInterestRate <= 0 || termInMonths <= 0) return 0;
    const monthlyRate = (annualInterestRate / 100) / 12;
    if (monthlyRate === 0) return maxInstallment * termInMonths;
    
    const r = monthlyRate;
    const n = termInMonths;
    const PMT = maxInstallment;

    // Present Value formula for an ordinary annuity
    const principal = (PMT / r) * (1 - Math.pow(1 + r, -n));
    return principal > 0 ? principal : 0;
};


export const useAffordabilityCalculator = (formData: FormData): CalculationResult => {
    return useMemo(() => {
        const {
            grossIncome, netIncome, employmentStatus, employmentLength, applicantAge, vehicleYear,
            freelanceIncomeMonth1, freelanceIncomeMonth2, freelanceIncomeMonth3,
            debtRepayments, rentMortgage, dependents, creditScore, adverseRecord,
            purchasePrice, deposit, loanTerm, balloonPercentage,
            insurance, fuel, maintenance
        } = formData;
        
        const averageFreelanceIncome = (freelanceIncomeMonth1 + freelanceIncomeMonth2 + freelanceIncomeMonth3) / 3;
        const totalGrossIncome = grossIncome + averageFreelanceIncome;

        if (!totalGrossIncome || !netIncome || !purchasePrice) {
            return INITIAL_CALCULATION_RESULT;
        }

        const reasoning: CheckResult[] = [];
        const warnings: string[] = [];
        let status: AffordabilityStatus = AffordabilityStatus.APPROVED;

        // --- Preliminary Checks (Hard Rejections) ---
        if (adverseRecord) {
            reasoning.push({ pass: false, message: 'Adverse Credit Record', value: 'Yes', limit: 'Must be No' });
            warnings.push("An adverse credit record is a primary reason for decline. Focus on resolving any defaults or judgments before reapplying.");
            return { ...INITIAL_CALCULATION_RESULT, status: AffordabilityStatus.NOT_APPROVED, reasoning, warnings, isCalculated: true };
        } else {
            reasoning.push({ pass: true, message: 'Adverse Credit Record', value: 'No', limit: 'Must be No' });
        }

        if (applicantAge < MIN_APPLICANT_AGE || applicantAge > MAX_APPLICANT_AGE) {
            reasoning.push({ pass: false, message: 'Applicant Age', value: `${applicantAge}`, limit: `${MIN_APPLICANT_AGE}-${MAX_APPLICANT_AGE}` });
            warnings.push("Applications can only be approved for individuals between the ages of 18 and 65.");
            return { ...INITIAL_CALCULATION_RESULT, status: AffordabilityStatus.NOT_APPROVED, reasoning, warnings, isCalculated: true };
        } else {
            reasoning.push({ pass: true, message: 'Applicant Age', value: `${applicantAge}`, limit: `${MIN_APPLICANT_AGE}-${MAX_APPLICANT_AGE}` });
        }

        const isNonPermanent = employmentStatus === EmploymentStatus.CONTRACT || employmentStatus === EmploymentStatus.SELF_EMPLOYED;
        if (isNonPermanent && employmentLength < MIN_NON_PERMANENT_EMPLOYMENT_MONTHS) {
            reasoning.push({ pass: false, message: 'Employment Stability', value: `${employmentLength} months`, limit: `> ${MIN_NON_PERMANENT_EMPLOYMENT_MONTHS} months` });
            warnings.push(`For ${employmentStatus} status, lenders require at least ${MIN_NON_PERMANENT_EMPLOYMENT_MONTHS} months of history. Continue building your track record.`);
            return { ...INITIAL_CALCULATION_RESULT, status: AffordabilityStatus.NOT_APPROVED, reasoning, warnings, isCalculated: true };
        } else {
            reasoning.push({ pass: true, message: 'Employment Stability', value: `${employmentLength} months`, limit: isNonPermanent ? `> ${MIN_NON_PERMANENT_EMPLOYMENT_MONTHS} months` : 'N/A' });
        }
        
        const vehicleAgeAtEnd = (new Date().getFullYear() - vehicleYear) + (loanTerm / 12);
        if (vehicleAgeAtEnd > MAX_VEHICLE_AGE_AT_END) {
             reasoning.push({ pass: false, message: 'Vehicle Age at Term End', value: `${vehicleAgeAtEnd.toFixed(1)} yrs`, limit: `< ${MAX_VEHICLE_AGE_AT_END} yrs` });
             warnings.push("The vehicle will be too old at the end of the term. Please choose a newer vehicle or a shorter loan term.");
             return { ...INITIAL_CALCULATION_RESULT, status: AffordabilityStatus.NOT_APPROVED, reasoning, warnings, isCalculated: true };
        } else {
             reasoning.push({ pass: true, message: 'Vehicle Age at Term End', value: `${vehicleAgeAtEnd.toFixed(1)} yrs`, limit: `< ${MAX_VEHICLE_AGE_AT_END} yrs` });
        }

        const interestRate = INTEREST_RATE_MAP[creditScore];
        if (interestRate === null) {
            reasoning.push({ pass: false, message: 'Credit Score', value: creditScore, limit: `> ${CreditScore.POOR}` });
            warnings.push("A 'Poor' credit score indicates high risk. Work on improving your score by paying bills on time and reducing existing debt before applying for new credit.");
            return { ...INITIAL_CALCULATION_RESULT, status: AffordabilityStatus.NOT_APPROVED, reasoning, warnings, isCalculated: true };
        } else {
            reasoning.push({ pass: true, message: 'Credit Score', value: creditScore, limit: `> ${CreditScore.POOR}` });
        }

        // --- Calculations for Requested Loan ---
        const requestedPrincipal = purchasePrice - deposit;
        const balloonAmount = purchasePrice * (balloonPercentage / 100);
        const monthlyInstallment = calculateMonthlyInstallment(requestedPrincipal, interestRate, loanTerm, balloonAmount);
        const totalMonthlyVehicleCost = monthlyInstallment + insurance + fuel + maintenance;
        
        // --- Affordability Checks ---
        // DTI Check
        const totalDebt = debtRepayments + monthlyInstallment;
        const dtiRatio = totalGrossIncome > 0 ? (totalDebt / totalGrossIncome) * 100 : 0;
        const dtiCheck = { pass: dtiRatio <= MAX_DTI_RATIO, message: 'Debt-to-Income Ratio', value: `${dtiRatio.toFixed(1)}%`, limit: `< ${MAX_DTI_RATIO}%` };
        reasoning.push(dtiCheck);

        // Disposable Income Check
        const dependentExpenses = dependents * LIVING_EXPENSE_PER_DEPENDENT;
        const totalExpenses = debtRepayments + rentMortgage + dependentExpenses + insurance + fuel + maintenance;
        const disposableIncome = netIncome - totalExpenses - monthlyInstallment;
        const disposableIncomeCheck = { pass: disposableIncome >= DISPOSABLE_INCOME_BUFFER, message: 'Disposable Income Buffer', value: `R ${disposableIncome.toFixed(2)}`, limit: `> R ${DISPOSABLE_INCOME_BUFFER.toFixed(2)}` };
        reasoning.push(disposableIncomeCheck);

        // TCO Check
        const tcoRatio = totalGrossIncome > 0 ? (totalMonthlyVehicleCost / totalGrossIncome) * 100 : 0;
        const tcoCheck = { pass: tcoRatio <= MAX_TCO_RATIO, message: 'Total Cost of Ownership', value: `${tcoRatio.toFixed(1)}%`, limit: `< ${MAX_TCO_RATIO}%` };
        reasoning.push(tcoCheck);

        // --- Calculate Max Loan Amount ---
        const maxInstallmentFromDTI = (totalGrossIncome * (MAX_DTI_RATIO / 100)) - debtRepayments;
        const maxInstallmentFromTCO = (totalGrossIncome * (MAX_TCO_RATIO / 100)) - (insurance + fuel + maintenance);
        const maxInstallmentFromDI = netIncome - (debtRepayments + rentMortgage + dependentExpenses + insurance + fuel + maintenance) - DISPOSABLE_INCOME_BUFFER;
        
        const maxAffordableInstallment = Math.max(0, Math.min(maxInstallmentFromDTI, maxInstallmentFromTCO, maxInstallmentFromDI));
        const maxLoanAmount = calculateMaxLoanPrincipal(maxAffordableInstallment, interestRate, loanTerm);

        // --- Determine Final Status & Generate Actionable Advice ---
        const affordabilityChecksPassed = dtiCheck.pass && disposableIncomeCheck.pass && tcoCheck.pass;

        if (!affordabilityChecksPassed) {
            status = AffordabilityStatus.NOT_APPROVED;
            
            if (requestedPrincipal > maxLoanAmount) {
                const requiredDepositIncrease = Math.max(0, requestedPrincipal - maxLoanAmount);
                warnings.push(`The requested loan of R ${requestedPrincipal.toFixed(2)} exceeds your maximum affordable amount. To fix this, increase your deposit by at least R ${requiredDepositIncrease.toFixed(2)} or choose a cheaper vehicle.`);
            }
             if (!dtiCheck.pass) {
                warnings.push("High Debt-to-Income Ratio: Your total debt is too high relative to your income. Try to pay down existing loans or credit cards to lower your monthly commitments.");
            }
            if (!disposableIncomeCheck.pass) {
                warnings.push("Low Disposable Income: Your income after all expenses is below the required R2,500 buffer. Review your budget to reduce monthly spending or lower the vehicle's running costs.");
            }
            if (!tcoCheck.pass) {
                warnings.push("High Cost of Ownership: The vehicle's total monthly cost exceeds 25% of your gross income. Consider a less expensive car, a larger deposit, or a model with lower insurance and fuel costs.");
            }

        } else if (dtiRatio > WARN_DTI_RATIO || tcoRatio > WARN_TCO_RATIO) {
            status = AffordabilityStatus.APPROVED_WITH_CONDITIONS;
        }
        
        // --- General Warnings ---
        if (balloonPercentage > 0) {
            warnings.push(`A ${balloonPercentage}% balloon payment requires a lump sum of R ${balloonAmount.toFixed(2)} at the end of the loan term. Ensure you plan for this.`);
        }
        if (purchasePrice > 0 && (deposit / purchasePrice < 0.1)) {
             warnings.push("A deposit of at least 10% is recommended. A larger deposit reduces your monthly installment and loan risk.");
        }

        return {
            status,
            maxLoanAmount,
            monthlyInstallment,
            totalMonthlyCost: totalMonthlyVehicleCost,
            interestRate,
            dtiRatio,
            tcoRatio,
            disposableIncome,
            reasoning,
            warnings,
            maxInstallmentFromDTI,
            maxInstallmentFromTCO,
            maxInstallmentFromDI,
            isCalculated: true,
        };

    }, [formData]);
};