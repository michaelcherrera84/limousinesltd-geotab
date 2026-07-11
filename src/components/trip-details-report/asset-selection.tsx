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

    /**
     * A memoized variable that determines the button text based on the current state.
     *
     * The button text is dynamically calculated based on the following conditions:
     * - If `showPlaceholder` is `true`, the text will be "Select Assets".
     * - If no assets are selected (`selectedAssets` array is empty), the text will be "Select Assets".
     * - If more than one asset is selected, the text will be "Multiple".
     * - If only one asset is selected, the text will display the name of that asset,
     *   provided it exists in the `assets` array. If the asset is not found, the text
     *   will default to "Select Asset".
     *
     * Dependencies for memoization:
     * - `showPlaceholder`: Boolean flag indicating whether to display the placeholder text.
     * - `selectedAssets`: Array of selected asset IDs.
     * - `assets`: Array of available asset objects, each containing an `id` and a `name` property.
     */
    const buttonText = useMemo(() => {
        if (showPlaceholder) return 'Select Assets';
        if (selectedAssets.length === 0) return 'Select Assets';
        if (selectedAssets.length > 1) return 'Multiple';

        const asset = assets.find((a) => a.id === selectedAssets[0]);
        return asset?.name ?? 'Select Asset';
    }, [showPlaceholder, selectedAssets, assets]);

    /**
     * Fetches all assets from the Geotab API and updates the `assets` state.
     */
    useEffect(() => {
        const getAssets = async () => {
            const assets: Asset[] = await geotabDevice.getAllTransfer();
            setAssets([{ id: 'All Transfer', name: 'All Transfer' }, ...assets]);
        };
        void getAssets();
    }, []);

    /**
     * Handles the addition or removal of an asset from the selected assets list.
     *
     * This function updates the state of selected assets based on the provided asset ID.
     * - If the asset ID is already selected, it will be removed from the list of selected assets.
     * - If the asset ID is "All Transfer", the list will be reset to include only "All Transfer".
     * - Otherwise, adds the provided asset ID to the list, ensuring "All Transfer" is excluded if present.
     *
     * @param {string} assetId - The unique identifier of the asset to be added or removed.
     */
    const handleAddAsset = (assetId: string) => {
        setSelectedAssets((prev) => {
            if (prev.includes(assetId)) return prev.filter((id) => id !== assetId);
            if (assetId === 'All Transfer') return ['All Transfer'];
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
                className="mt-1 flex w-52 flex-col rounded border border-(--border-primary) bg-white shadow-lg
                    shadow-gray-300 outline-none absolute"
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
