import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { geotabDriver } from '@/services/geotab/driver.ts';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CheckIcon, ChevronDown } from 'lucide-react';
import type { Driver } from '@/components/trip-details-report/report-types.ts';

interface DriverSelectionProps {
    selectedDrivers: string[];
    setSelectedDrivers: Dispatch<SetStateAction<string[]>>;
}

function DriverSelection({ selectedDrivers, setSelectedDrivers }: DriverSelectionProps) {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    /**
     * The dynamic text displayed on a button, determined based on the selection state of drivers.
     *
     * This memoized value adjusts the button text depending on the following conditions:
     * - If `showPlaceholder` is true, the button displays "Select Drivers".
     * - If there are no selected drivers (`selectedDrivers` is empty), the button displays "Select Drivers".
     * - If multiple drivers are selected (`selectedDrivers.length > 1`), the button displays "Multiple".
     * - If exactly one driver is selected, the button displays the full name (first name and last name) of the selected driver.
     *   If the driver's name is not available, it defaults to "Select Drivers".
     *
     * Dependencies:
     * - `showPlaceholder`: Boolean that determines whether to show the placeholder text.
     * - `selectedDrivers`: An array of selected driver IDs.
     * - `drivers`: An array of driver objects used to find details of selected drivers.
     */
    const buttonText = useMemo(() => {
        if (showPlaceholder) return 'Select Drivers';
        if (selectedDrivers.length === 0) return 'Select Drivers';
        if (selectedDrivers.length > 1) return 'Multiple';

        const driver = drivers.find((d) => d.id === selectedDrivers[0]);
        return driver?.firstName && driver.lastName ? driver.firstName + ' ' + driver.lastName : 'Select Drivers';
    }, [showPlaceholder, selectedDrivers, drivers]);

    /**
     * Fetches all drivers from the Geotab API and updates the `drivers` state.
     */
    useEffect(() => {
        const getDrivers = async () => {
            const drivers: Driver[] = await geotabDriver.getTransfer();
            setDrivers([{ id: 'All Transfer', firstName: 'All', lastName: 'Transfer' }, ...drivers]);
        };
        void getDrivers();
    }, []);

    /**
     * Handles the addition or removal of a driver to the selected drivers list.
     *
     * If the provided `driverId` is already in the list of selected drivers, it will be removed.
     * If the `driverId` is "All Transfer", it will replace all other selected drivers with itself.
     * In other cases, the `driverId` will be added to the list, while ensuring "All Transfer" is removed if it exists.
     *
     * @param {string} driverId - The unique identifier of the driver to add or remove.
     */
    const handleAddDriver = (driverId: string) => {
        setSelectedDrivers((prevDrivers) => {
            if (prevDrivers.includes(driverId)) return prevDrivers.filter((id) => id !== driverId);
            if (driverId === 'All Transfer') return ['All Transfer'];
            return [...prevDrivers.filter((id) => id !== 'All Transfer'), driverId];
        });
    };

    return (
        <Menu as="div" className="w-fit" defaultValue={selectedDrivers}>
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
                {drivers.map((driver) => (
                    <MenuItem key={driver.id}>
                        <div
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm
                            hover:bg-(--dropdown-hover)
                            ${selectedDrivers.includes(driver.id) && 'bg-(--dropdown-hover)'}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleAddDriver(driver.id);
                            }}
                        >
                            <div className="w-3">
                                {selectedDrivers.includes(driver.id) && (
                                    <CheckIcon className="stroke-primary stroke-4" size={12} />
                                )}
                            </div>
                            {driver.firstName + ' ' + driver.lastName}
                        </div>
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
}

export default DriverSelection;
