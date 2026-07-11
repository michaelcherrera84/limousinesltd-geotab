import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CheckIcon, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '@/components/trip-details-report/report-types.ts';

interface CategorySelectionProps {
    selectedCategories: string[];
    setSelectedCategories: Dispatch<SetStateAction<string[]>>;
}

function CategorySelection({ selectedCategories, setSelectedCategories }: CategorySelectionProps) {
    const [showPlaceHolder, setShowPlaceholder] = useState<boolean>(true);

    /**
     * A memoized variable that determines the text to be displayed on a button based on the current state.
     * The value of the buttonText is computed using the following logic:
     * - If `showPlaceHolder` is true, the text will be 'Select Categories'.
     * - If `showPlaceHolder` is false and `selectedCategories` is an empty array, the text will be 'Select Categories'.
     * - If `selectedCategories` has exactly one item, the text will be the name of that category.
     * - If `selectedCategories` contains more than one category, the text will be 'All'.
     *
     * Dependencies:
     * - `showPlaceHolder`: A boolean indicating whether a placeholder should be shown.
     * - `selectedCategories`: An array of selected category names.
     */
    const buttonText = useMemo(() => {
        if (showPlaceHolder) return 'Select Categories';
        if (selectedCategories.length === 0) return 'Select Categories';
        if (selectedCategories.length === 1) return selectedCategories[0];
        return 'All';
    }, [showPlaceHolder, selectedCategories]);

    /**
     * Updates the list of selected categories based on the specified category name.
     *
     * - If the specified category name is already in the list, it will be removed.
     * - If the specified category name is "All", the list will be reset to include only "All".
     * - If the specified category name is not "All", it will be added to the list after removing "All" if present.
     *
     * @param {string} categoryName - The name of the category to add or remove.
     * @returns {void}
     */
    const handleAddCategory = (categoryName: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(categoryName)) return prev.filter((name) => name !== categoryName);
            if (categoryName === 'All') return ['All'];
            return [...prev.filter((category) => category !== 'All'), categoryName];
        });
    };

    return (
        <Menu as="div" className="w-fit" defaultValue={selectedCategories}>
            <MenuButton
                className="flex w-52 items-center justify-between gap-2 rounded border border-(--border-primary) px-4
                    py-1 text-xs outline-none hover:border-(--border-hover) hover:bg-(--dropdown-hover)"
                onClick={() => setShowPlaceholder(false)}
            >
                {buttonText}
                <ChevronDown />
            </MenuButton>
            <MenuItems
                className="absolute mt-1 flex w-52 flex-col rounded border border-(--border-primary) bg-white shadow-lg
                    shadow-gray-300 outline-none"
            >
                {CATEGORIES.map((category) => (
                    <MenuItem key={category}>
                        <div
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm
                            hover:bg-(--dropdown-hover)
                            ${selectedCategories.includes(category) && 'bg-(--dropdown-hover)'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleAddCategory(category);
                            }}
                        >
                            <div className="w-3">
                                {selectedCategories.includes(category) && (
                                    <CheckIcon className="stroke-primary stroke-4" size={12} />
                                )}
                            </div>
                            {category}
                        </div>
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
}

export default CategorySelection;
