import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CheckIcon, ChevronDown } from 'lucide-react';

interface CategorySelectionProps {
    selectedCategories: string[];
    setSelectedCategories: Dispatch<SetStateAction<string[]>>;
}

const categories = ['All', 'Business', 'Personal'];

function CategorySelection({ selectedCategories, setSelectedCategories }: CategorySelectionProps) {
    const [showPlaceHolder, setShowPlaceholder] = useState<boolean>(true);

    const buttonText = useMemo(() => {
        if (showPlaceHolder) return 'Select Categories';
        if (selectedCategories.length === 0) return 'Select Categories';
        if (selectedCategories.length === 1) return selectedCategories[0];
        return 'All';
    }, [showPlaceHolder, selectedCategories]);

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
                anchor="bottom"
                className="mt-1 flex w-52 flex-col rounded border border-(--border-primary) bg-white shadow-lg
                    shadow-gray-300 outline-none"
            >
                {categories.map((category) => (
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
