import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Upload, ScanLine } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Tesseract from 'tesseract.js';

const ScanReceiptModal = ({ onClose, onItemsExtracted }) => {
    const [scanning, setScanning] = useState(false);
    const [scanMethod, setScanMethod] = useState('qr'); // 'qr' or 'ocr'
    const [processing, setProcessing] = useState(false);
    const [extractedItems, setExtractedItems] = useState([]);
    const scannerRef = useRef(null);
    const qrScannerInstance = useRef(null);

    useEffect(() => {
        if (scanning && scanMethod === 'qr') {
            initQRScanner();
        }

        return () => {
            if (qrScannerInstance.current) {
                qrScannerInstance.current.clear();
            }
        };
    }, [scanning, scanMethod]);

    const initQRScanner = () => {
        if (!scannerRef.current) return;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
        };

        const scanner = new Html5QrcodeScanner('qr-reader', config, false);
        qrScannerInstance.current = scanner;

        scanner.render(
            (decodedText) => {
                handleQRSuccess(decodedText);
                scanner.clear();
            },
            (error) => {
                // Silent - scanning errors are normal
            }
        );
    };

    const handleQRSuccess = async (qrData) => {
        setProcessing(true);
        try {
            // Parse QR data - assuming it contains receipt information
            // Format could be JSON or a URL to receipt data
            let receiptData;

            try {
                receiptData = JSON.parse(qrData);
            } catch {
                // If not JSON, treat as receipt URL or ID
                alert('QR code format not recognized. Please use a receipt with item details.');
                setProcessing(false);
                return;
            }

            // Extract items from receipt data
            const items = parseReceiptData(receiptData);
            setExtractedItems(items);
            setScanning(false);
        } catch (error) {
            console.error('Error processing QR code:', error);
            alert('Failed to process QR code');
        } finally {
            setProcessing(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProcessing(true);
        try {
            // Use Tesseract.js for OCR
            const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                logger: (m) => console.log(m),
            });

            // Parse receipt text
            const items = parseReceiptText(text);
            setExtractedItems(items);
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Failed to extract text from image');
        } finally {
            setProcessing(false);
        }
    };

    const isJunkItemName = (name) => {
        const junk = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'dolore', 'adipiscing', 'elit', 'sed'];
        const lower = (name || '').toLowerCase().trim();
        if (lower.length < 3) return true;
        return junk.some(word => lower === word || lower.startsWith(word + ' '));
    };

    const parseReceiptData = (data) => {
        // Expected format: { items: [{ name, quantity, price, expiry }] }
        if (data.items && Array.isArray(data.items)) {
            return data.items
                .filter((item) => item.name && !isJunkItemName(item.name))
                .map((item) => ({
                    name: item.name.trim(),
                    category: guessCategory(item.name),
                    quantity: item.quantity || 1,
                    unit: 'pcs',
                    expiry_date: item.expiry || getDefaultExpiry(),
                    purchase_price: item.price || '',
                    notes: `Imported from receipt on ${new Date().toLocaleDateString()}`,
                }));
        }
        return [];
    };

    const parseReceiptText = (text) => {
        // More robust parser - handles multiple formats
        const lines = text.split('\n').filter((line) => line.trim().length > 2);
        const items = [];

        // Common receipt line patterns
        const patterns = [
            /([A-Za-z\s]+)\s+(\d+)\s+.*?(\d+\.?\d*)/, // Name Qty Price
            /([A-Za-z\s]+)\s+.*?(\d+\.?\d*)\s*$/,    // Name Price (at end)
            /^\s*(\d+)\s+([A-Za-z\s]+)/,             // Qty Name
        ];

        // Receipt headers/footers and Latin placeholder words (OCR junk - never add to pantry)
        const blacklist = [
            'total', 'tax', 'subtotal', 'cash', 'change', 'visa', 'master', 'save', 'date', 'order', 'receipt',
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'dolore', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod',
            'tempor', 'incididunt', 'ut', 'labore', 'et', 'magna', 'aliqua', 'enim', 'minim', 'veniam', 'quis', 'nostrud',
            'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute',
            'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur'
        ];

        const isJunkName = (name) => {
            const lower = name.toLowerCase().trim();
            if (lower.length < 3) return true;
            const words = lower.split(/\s+/).filter(Boolean);
            const allJunk = words.every(w => blacklist.includes(w) || w.length < 2);
            const singleJunkWord = words.length === 1 && blacklist.includes(words[0]);
            return allJunk || singleJunkWord;
        };

        lines.forEach((line) => {
            let matched = false;

            // Try defined patterns
            for (const pattern of patterns) {
                const match = line.match(pattern);
                if (match) {
                    const name = (pattern.source.includes('^\\s*(\\d+)') ? match[2] : match[1]).trim();
                    const quantity = (pattern.source.includes('^\\s*(\\d+)') ? match[1] : (match.length > 3 ? match[2] : 1));
                    const price = (match.length > 3 ? match[3] : (pattern.source.includes('(\\d+\\.?\\d*)\\s*$') ? match[2] : ''));

                    if (name.length > 2 && !blacklist.some(word => name.toLowerCase().includes(word)) && !isJunkName(name)) {
                        items.push({
                            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
                            category: guessCategory(name),
                            quantity: parseInt(quantity) || 1,
                            unit: 'pcs',
                            expiry_date: getDefaultExpiry(),
                            purchase_price: parseFloat(price) || '',
                            notes: `Imported from receipt scan`,
                        });
                        matched = true;
                        break;
                    }
                }
            }

            // Fallback: If no pattern matches but it looks like a single item name (and not Latin/placeholder junk)
            const fallbackName = line.trim();
            if (!matched && fallbackName.length > 3 && fallbackName.length < 30 && !fallbackName.match(/\d/) &&
                !blacklist.some(word => fallbackName.toLowerCase().includes(word)) && !isJunkName(fallbackName)) {
                items.push({
                    name: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1).toLowerCase(),
                    category: guessCategory(fallbackName),
                    quantity: 1,
                    unit: 'pcs',
                    expiry_date: getDefaultExpiry(),
                    purchase_price: '',
                    notes: `Imported from receipt scan`,
                });
            }
        });

        return items;
    };

    const guessCategory = (itemName) => {
        const name = itemName.toLowerCase();

        if (name.match(/milk|cheese|yogurt|butter|cream/)) return 'Dairy';
        if (name.match(/tomato|lettuce|onion|potato|carrot|vegetable|fruit|apple|banana/)) return 'Produce';
        if (name.match(/chicken|beef|pork|fish|meat/)) return 'Meat';
        if (name.match(/rice|bread|pasta|flour|cereal/)) return 'Grains';
        if (name.match(/juice|soda|water|coffee|tea/)) return 'Beverages';
        if (name.match(/chips|cookie|candy|snack/)) return 'Snacks';
        if (name.match(/ice cream|frozen/)) return 'Frozen';
        if (name.match(/cake|donut|pastry/)) return 'Bakery';

        return 'Other';
    };

    const getDefaultExpiry = () => {
        // Default to 7 days from now
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    };

    const handleAddItems = () => {
        onItemsExtracted(extractedItems);
        onClose();
    };

    const removeItem = (index) => {
        setExtractedItems(extractedItems.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-card bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-emerald-100">
                    <div>
                        <h2 className="text-2xl font-black text-emerald-950">Scan Receipt</h2>
                        <p className="text-sm text-emerald-600 mt-1">
                            Scan QR code or upload receipt image to extract items
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-emerald-100 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6 text-emerald-600" />
                    </button>
                </div>

                <div className="p-6">
                    {!scanning && extractedItems.length === 0 && (
                        <div className="space-y-4">
                            {/* Scan Method Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        setScanMethod('qr');
                                        setScanning(true);
                                    }}
                                    className="glass-card p-6 bg-white/60 hover:bg-emerald-50 transition-all text-center"
                                >
                                    <div className="text-5xl mb-3">📱</div>
                                    <h3 className="font-black text-emerald-950 mb-2">Scan QR Code</h3>
                                    <p className="text-sm text-emerald-600">
                                        Use your camera to scan a receipt QR code
                                    </p>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700">
                                        <Camera className="w-5 h-5" />
                                        <span className="font-bold">Open Camera</span>
                                    </div>
                                </button>

                                <label className="glass-card p-6 bg-white/60 hover:bg-emerald-50 transition-all text-center cursor-pointer">
                                    <div className="text-5xl mb-3">📄</div>
                                    <h3 className="font-black text-emerald-950 mb-2">Upload Receipt</h3>
                                    <p className="text-sm text-emerald-600">
                                        Upload a photo of your receipt for OCR
                                    </p>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700">
                                        <Upload className="w-5 h-5" />
                                        <span className="font-bold">Choose File</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Demo/Manual Entry */}
                            <div className="glass-card p-4 bg-emerald-50 border border-emerald-200">
                                <p className="text-sm text-emerald-800">
                                    <strong>💡 Tip:</strong> For best results with QR codes, ensure the receipt QR contains item details in JSON format. For photo uploads, make sure the text is clear and well-lit.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* QR Scanner */}
                    {scanning && scanMethod === 'qr' && (
                        <div>
                            <div
                                id="qr-reader"
                                ref={scannerRef}
                                className="rounded-2xl overflow-hidden"
                            />
                            <button
                                onClick={() => {
                                    setScanning(false);
                                    if (qrScannerInstance.current) {
                                        qrScannerInstance.current.clear();
                                    }
                                }}
                                className="btn-secondary w-full mt-4"
                            >
                                Cancel Scanning
                            </button>
                        </div>
                    )}

                    {/* Processing */}
                    {processing && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-emerald-600 font-bold">Processing receipt...</p>
                        </div>
                    )}

                    {/* Extracted Items */}
                    {extractedItems.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-emerald-950">
                                    Extracted Items ({extractedItems.length})
                                </h3>
                                <button
                                    onClick={() => setExtractedItems([])}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-bold"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {extractedItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="glass-card p-4 bg-white/60 flex items-center gap-4"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-black text-emerald-950">{item.name}</h4>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-emerald-600">
                                                <span>{item.category}</span>
                                                <span>•</span>
                                                <span>
                                                    {item.quantity} {item.unit}
                                                </span>
                                                {item.purchase_price && (
                                                    <>
                                                        <span>•</span>
                                                        <span>₹{item.purchase_price}</span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span className="italic opacity-70">{item.notes}</span>
                                                <span>•</span>
                                                <span>Expires: {item.expiry_date}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="p-2 hover:bg-red-100 rounded-xl transition-all text-red-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-emerald-100">
                                <button
                                    onClick={() => setExtractedItems([])}
                                    className="btn-secondary flex-1"
                                >
                                    Rescan
                                </button>
                                <button onClick={handleAddItems} className="btn-premium flex-1">
                                    Add {extractedItems.length} Items to Pantry
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScanReceiptModal;
