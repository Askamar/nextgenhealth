import React, { useState } from 'react';
import {
    CreditCard, Check, Shield, Lock, IndianRupee,
    Smartphone, Building2, Wallet, Clock, CheckCircle
} from 'lucide-react';

interface PaymentModalProps {
    amount: number;
    description: string;
    doctorName?: string;
    onSuccess: () => void;
    onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    amount,
    description,
    doctorName,
    onSuccess,
    onClose
}) => {
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const handlePayment = async () => {
        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProcessing(false);
        setSuccess(true);

        // Auto-close after success
        setTimeout(() => {
            onSuccess();
        }, 2000);
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle size={48} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        ₹{amount.toLocaleString()} paid for {description}
                    </p>
                    <p className="text-sm text-slate-400">
                        Transaction ID: TXN{Date.now().toString(36).toUpperCase()}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Complete Payment</h2>
                        <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">{description}</p>
                            {doctorName && <p className="text-blue-100 text-sm">Doctor: {doctorName}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm">Amount</p>
                            <p className="text-3xl font-bold flex items-center">
                                <IndianRupee size={24} />
                                {amount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        {[
                            { id: 'upi', icon: Smartphone, label: 'UPI' },
                            { id: 'card', icon: CreditCard, label: 'Card' },
                            { id: 'netbanking', icon: Building2, label: 'Bank' },
                            { id: 'wallet', icon: Wallet, label: 'Wallet' }
                        ].map(method => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === method.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                <method.icon size={20} className={
                                    paymentMethod === method.id ? 'text-blue-500' : 'text-slate-400'
                                } />
                                <span className={`text-xs font-medium ${paymentMethod === method.id
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-slate-500'
                                    }`}>
                                    {method.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* UPI Form */}
                    {paymentMethod === 'upi' && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter UPI ID (e.g., name@paytm)"
                                value={upiId}
                                onChange={e => setUpiId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="flex gap-2 justify-center">
                                {['@paytm', '@gpay', '@ybl', '@oksbi'].map(suffix => (
                                    <button
                                        key={suffix}
                                        onClick={() => setUpiId(prev => prev.split('@')[0] + suffix)}
                                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                    >
                                        {suffix}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Card Form */}
                    {paymentMethod === 'card' && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Card Number"
                                value={cardNumber}
                                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={e => setCardExpiry(e.target.value)}
                                    maxLength={5}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="password"
                                    placeholder="CVV"
                                    value={cardCvv}
                                    onChange={e => setCardCvv(e.target.value)}
                                    maxLength={3}
                                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Net Banking */}
                    {paymentMethod === 'netbanking' && (
                        <div className="grid grid-cols-2 gap-3">
                            {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bank => (
                                <button
                                    key={bank}
                                    className="p-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-slate-700 dark:text-slate-300 font-medium"
                                >
                                    {bank} Bank
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Wallet */}
                    {paymentMethod === 'wallet' && (
                        <div className="grid grid-cols-2 gap-3">
                            {['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik'].map(wallet => (
                                <button
                                    key={wallet}
                                    className="p-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-slate-700 dark:text-slate-300 font-medium"
                                >
                                    {wallet}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 text-sm">
                        <Lock size={14} />
                        <span>Secured by 256-bit SSL encryption</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                    >
                        {processing ? (
                            <>
                                <Clock className="animate-spin" size={18} />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Shield size={18} />
                                Pay ₹{amount.toLocaleString()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
