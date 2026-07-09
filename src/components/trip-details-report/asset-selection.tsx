import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CheckIcon, ChevronDown } from 'lucide-react';
import { geotabDevice } from '@/services/geotab/device.ts';
import type { Asset } from '@/components/trip-details-report/report-types.ts';

interface AssetSelectionProps {
    selectedAssets: string[];
    setSelectedAssets: Dispatch<SetStateAction<string[]>>;
}

function AssetSelection({ selectedAssets, setSelectedAssets }: AssetSelectionProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    const buttonText = useMemo(() => {
        if (showPlaceholder) return 'Select Assets';
        if (selectedAssets.length === 0) return 'Select Assets';
        if (selectedAssets.length > 1) return 'Multiple';

        const asset = assets.find((a) => a.id === selectedAssets[0]);
        return asset?.name ?? 'Select Asset';
    }, [showPlaceholder, selectedAssets, assets]);

    useEffect(() => {
        const getAssets = async () => {
            const assets: Asset[] = await geotabDevice.getAllTransfer();
            setAssets([{ id: 'All Transfer', name: 'All Transfer' }, ...assets]);
        };
        void getAssets();
    }, []);

    const handleAddAsset = (assetId: string) => {
        setSelectedAssets((prev) => {
            // Remove the clicked asset if it's already selected
            if (prev.includes(assetId)) return prev.filter((id) => id !== assetId);

            // Selecting "All Transfer" clears everything else
            if (assetId === 'All Transfer') return ['All Transfer'];

            // Selecting a specific asset removes "All Transfer"
            return [...prev.filter((id) => id !== 'All Transfer'), assetId];
        });
    };

    return (
        <Menu as="div" className="w-fit" defaultValue={selectedAssets}>
            <MenuButton
                className="flex w-52 items-center justify-between gap-2 rounded border border-(--border-primary) px-4
                    py-1 text-xs outline-none hover:border-(--border-hover) hover:bg-(--dropdown-hover)"
                onClick={() => setShowPlaceholder(false)}
            >
                {buttonText}
                <ChevronDown />
            </MenuButton>
            <MenuItems
                anchor="bottom"
                className="mt-1 flex w-52 flex-col rounded border border-(--border-primary) bg-white shadow-lg
                    shadow-gray-300 outline-none"
            >
                {assets.map((asset) => (
                    <MenuItem key={asset.id}>
                        <div
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm
                            hover:bg-(--dropdown-hover) ${selectedAssets.includes(asset.id) && 'bg-(--dropdown-hover)'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleAddAsset(asset.id);
                            }}
                        >
                            <div className="w-3">
                                {selectedAssets.includes(asset.id) && (
                                    <CheckIcon className="stroke-primary stroke-4" size={12} />
                                )}
                            </div>
                            {asset.name.split('(')[0]}
                        </div>
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
}

export default AssetSelection;
