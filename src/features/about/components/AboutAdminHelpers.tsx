import { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, ExternalLink, GripVertical } from "lucide-react";

// --- Types ---
interface FieldDef {
    key: string;
    label: string;
    placeholder?: string;
    type?: "text" | "textarea";
}

interface ItemListEditorProps {
    value: string; // JSON string
    onChange: (json: string) => void;
    fields: FieldDef[];
    title: string;
    description?: string;
}

// --- Item List Editor ---
export function ItemListEditor({ value, onChange, fields, title, description }: ItemListEditorProps) {
    const [items, setItems] = useState<any[]>([]);
    const [parseError, setParseError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const parsed = value ? JSON.parse(value) : [];
            if (Array.isArray(parsed)) {
                setItems(parsed);
                setParseError(null);
            } else {
                // If it's not an array (e.g. empty string), default to empty array
                if (!value) setItems([]);
                else setParseError("Current value is not a valid list.");
            }
        } catch (e) {
            // If invalid JSON, we might want to just show empty or handle it gracefully
            // For now, if it fails to parse, we assume it's empty or keep previous valid state if we were editing it directly?
            // Actually, better to just log it. The parent component handles the raw string.
            console.error("Failed to parse JSON", e);
            setParseError("Invalid JSON data");
        }
    }, [value]);

    const updateItem = (index: number, fieldKey: string, newValue: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [fieldKey]: newValue };
        setItems(newItems);
        onChange(JSON.stringify(newItems));
    };

    const addItem = () => {
        const emptyItem: any = {};
        fields.forEach(f => emptyItem[f.key] = "");
        const newItems = [...items, emptyItem];
        setItems(newItems);
        onChange(JSON.stringify(newItems));
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        onChange(JSON.stringify(newItems));
    };

    if (parseError) {
        return (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-md">
                <p className="text-red-400 text-sm">Error: {parseError}</p>
                <button
                    onClick={() => { onChange("[]"); setParseError(null); }}
                    className="text-xs text-red-300 underline mt-2"
                >
                    Reset to Empty List
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">{title}</label>
                    {description && <p className="text-xs text-zinc-600 mt-1">{description}</p>}
                </div>
                <button
                    onClick={addItem}
                    className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider"
                >
                    <Plus className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="bg-zinc-950 border border-zinc-800 p-4 rounded-sm relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => removeItem(index)}
                                className="text-zinc-600 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {fields.map((field) => (
                                <div key={field.key} className="space-y-1">
                                    <label className="text-[10px] uppercase text-zinc-600 font-bold">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={item[field.key] || ""}
                                            onChange={(e) => updateItem(index, field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            rows={2}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-red-600 outline-none rounded-sm"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={item[field.key] || ""}
                                            onChange={(e) => updateItem(index, field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-red-600 outline-none rounded-sm"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-zinc-800 rounded-sm">
                        <p className="text-zinc-600 text-sm mb-2">No items yet</p>
                        <button
                            onClick={addItem}
                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 rounded-sm text-xs font-medium transition-colors border border-zinc-800"
                        >
                            Add Your First Item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Image Preview Input ---
interface ImagePreviewInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}

export function ImagePreviewInput({ label, value, onChange, placeholder }: ImagePreviewInputProps) {
    const [isValidImage, setIsValidImage] = useState(false);

    // Simple check if it looks like an image URL, or just trust the browser's img tag error handling
    useEffect(() => {
        setIsValidImage(!!value);
    }, [value]);

    return (
        <div className="space-y-3">
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">{label}</label>
            <div className="flex gap-4 items-start">
                <div className="flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white focus:border-red-600 outline-none transition-all font-medium mb-2"
                    />
                    <p className="text-[10px] text-zinc-600">
                        Paste a URL for the image.
                        <span className="ml-1 text-zinc-500 italic">Recommended: host images on a public cloud and paste the link here.</span>
                    </p>
                </div>

                {/* Preview Box */}
                <div className="w-24 h-24 bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden relative group rounded-sm">
                    {value ? (
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                setIsValidImage(false);
                            }}
                            onLoad={() => setIsValidImage(true)}
                        />
                    ) : (
                        <ImageIcon className="w-6 h-6 text-zinc-700" />
                    )}

                    {!isValidImage && value && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 text-[10px] text-red-500 text-center p-1">
                            Invalid Image
                        </div>
                    )}

                    {isValidImage && (
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                            <ExternalLink className="w-4 h-4 text-white" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
