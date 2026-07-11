import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { DayPicker, type DateRange } from '@daypicker/react';
import '@daypicker/react/style.css';

interface DateSelectionProps {
    selectedDate: string;
    setSelectedDate: Dispatch<SetStateAction<string>>;
    setDateRange: Dispatch<SetStateAction<Date[]>>;
}

const dateMenuItems = ['Today', 'Yesterday', 'Last 24 Hours', 'Last 7 Days', 'This Pay Period', 'Last Pay Period'];

function DateSelection({ selectedDate, setSelectedDate, setDateRange }: DateSelectionProps) {
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
    const [showPlaceholder, setShowPlaceholder] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    /**
     * A memoized variable that determines the text to be displayed on a button.
     *
     * The value is dynamically determined based on the `showPlaceholder` and `selectedDate` states:
     * - If `showPlaceholder` is true, the text will be set to "Select Dates".
     * - Otherwise, it will display the value of `selectedDate`.
     *
     * Dependencies:
     * - `showPlaceholder`: A boolean indicating whether to show the placeholder text.
     * - `selectedDate`: A string representing the currently selected date.
     */
    const buttonText = useMemo(() => {
        if (showPlaceholder) return 'Select Dates';
        return selectedDate;
    }, [showPlaceholder, selectedDate]);

    /**
     * Updates the selected date and sets the corresponding date range or state based on predefined date ranges.
     *
     * @param {string} item - The selected date range identifier. Possible values include:
     *                        'Today', 'Yesterday', 'Last 24 Hours', 'Last 7 Days',
     *                        'This Pay Period', 'Last Pay Period', or custom date range identifiers.
     *
     * Description:
     * - When 'Today' is selected, sets the date range from the start of today to the start of tomorrow.
     * - When 'Yesterday' is selected, sets the date range from the start of yesterday to the start of today.
     * - When 'Last 24 Hours' is selected, sets the date range from 24 hours ago to the current time.
     * - When 'Last 7 Days' is selected, sets the date range from 7 days ago to the current time.
     * - When 'This Pay Period' is selected, calculates the start of the current pay period (Wednesday) and sets the date range.
     * - When 'Last Pay Period' is selected, determines the previous pay period (Wednesday to Wednesday)
     *   and sets the corresponding date range.
     * - If the selected item falls outside the predefined ranges, opens the date selection modal.
     *
     * Side Effects:
     * - Updates the state variables `selectedDate`, `dateRange`, and optionally toggles `isOpen`.
     */
    const handleSelectDate = (item: string) => {
        setSelectedDate(item);

        if (item === 'Today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today.getTime() + 86400000);
            setDateRange([today, tomorrow]);
        } else if (item === 'Yesterday') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const today = new Date(yesterday.getTime() + 86400000);
            setDateRange([yesterday, today]);
        } else if (item === 'Last 24 Hours') {
            const today = new Date();
            const yesterday = new Date(today.getTime() - 86400000);
            setDateRange([yesterday, today]);
        } else if (item === 'Last 7 Days') {
            const current = new Date();
            const past = new Date(current.getTime() - 86400000 * 7);
            setDateRange([past, current]);
        } else if (item === 'This Pay Period') {
            const current = new Date();
            const day = current.getDay();
            const target = 3; // Wednesday
            const diff = (day - target + 7) % 7;
            const past = new Date(current.getTime() - diff * 86400000);
            past.setHours(0, 0, 0, 0);
            setDateRange([past, current]);
        } else if (item === 'Last Pay Period') {
            const last = new Date();
            const day = last.getDay();
            const target = 3; // Wednesday
            const diff = (day - target + 7) % 7;
            last.setDate(last.getDate() - diff);
            last.setHours(0, 0, 0, 0);
            const past = new Date(last.getTime() - 86400000 * 7);
            setDateRange([past, last]);
        } else {
            setIsOpen(true);
        }
    };

    /**
     * Processes and handles the custom date range selected by the user.
     *
     * This function validates the presence of `from` and `to` dates in the `customDateRange` object.
     * If valid, it creates `Date` objects for the `from` and `to` dates. The `from` date is normalized
     * to the start of the day (midnight), while the `to` date is adjusted to include the entire end
     * day by setting it to the start of the next day (midnight).
     *
     * The processed date range is then stored in the application state via the `setDateRange` method.
     * Additionally, a string representation of the selected date range is generated and saved using
     * the `setSelectedDate` method.
     */
    const handleCustomDateRange = () => {
        if (!customDateRange?.from || !customDateRange.to) return;
        const from = new Date(customDateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = new Date(customDateRange.to);
        to.setDate(to.getDate() + 1);
        to.setHours(0, 0, 0, 0);
        setDateRange([from, to]);
        setSelectedDate(from.toLocaleDateString() + ' - ' + to.toLocaleDateString());
    };

    return (
        <>
            <Menu as="div" className="w-fit" defaultValue={selectedDate}>
                <MenuButton
                    className="flex w-52 items-center justify-between gap-2 rounded border border-(--border-primary)
                        px-4 py-1 text-xs outline-none hover:border-(--border-hover) hover:bg-(--dropdown-hover)"
                    onClick={() => setShowPlaceholder(false)}
                >
                    {buttonText}
                    <ChevronDown />
                </MenuButton>
                <MenuItems
                    className="absolute mt-1 flex w-52 flex-col rounded border border-(--border-primary) bg-white
                        shadow-lg shadow-gray-300 outline-none"
                >
                    {dateMenuItems.map((item) => (
                        <MenuItem key={item}>
                            <button
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-(--dropdown-hover)
                                ${item === selectedDate && 'bg-(--dropdown-hover)'}`}
                                value={item}
                                onClick={() => handleSelectDate(item)}
                            >
                                {item}
                            </button>
                        </MenuItem>
                    ))}
                    <MenuItem>
                        <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-(--dropdown-hover)"
                            value={'Custom Date Range'}
                            onClick={() => handleSelectDate('Custom Date Range')}
                        >
                            Custom Date Range
                        </button>
                    </MenuItem>
                </MenuItems>
            </Menu>
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-999999">
                <DialogBackdrop className="fixed inset-0 z-999999 bg-black/30" />
                <div className="fixed inset-0 z-1000000 flex w-screen items-center justify-center">
                    <DialogPanel className="max-w-lg space-y-4 rounded-lg bg-white px-14 py-10 shadow-lg">
                        <DialogTitle className="text-primary text-lg font-black">Custom Date Range</DialogTitle>
                        <DayPicker
                            animate
                            fixedWeeks
                            captionLayout="dropdown"
                            mode="range"
                            min={0}
                            startMonth={new Date(new Date().setFullYear(new Date().getFullYear() - 10))}
                            endMonth={new Date()}
                            required
                            selected={customDateRange}
                            onSelect={setCustomDateRange}
                        />
                        <div className="flex gap-3">
                            <CloseButton
                                onClick={() => setIsOpen(false)}
                                className="cursor-pointer rounded border border-red-700 bg-red-700 px-4 py-1 text-xs
                                    text-white shadow shadow-gray-400 hover:border-red-800 hover:bg-red-800"
                            >
                                Cancel
                            </CloseButton>
                            <CloseButton className="btn-primary shadow" onClick={handleCustomDateRange}>
                                Submit
                            </CloseButton>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}

export default DateSelection;
