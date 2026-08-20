import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Car as CarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { carService } from "@/services/carService";

export type StockCar = {
  _id: string;
  company: string;
  model: string;
  variant?: string;
  year: number;
  registrationNumber?: string;
  localNumber?: string;
  salePrice?: number;
  status: string;
  // FIX: additional fields used by ExchangeForm's dealer/papers snapshot
  carType?: string;
  registrationCity?: string;
  dealerName?: string;
  userName?: string;
  userPhone?: string;
  userAddress?: string;
};

/**
 * Searchable combobox that loads real cars from the backend (/api/cars)
 * and wires the selection to the actual MongoDB ObjectId — used for the
 * "Select Showroom Vehicle (From Stock)" step of the exchange flow.
 */
export function CarStockCombobox({
  value,
  onSelect,
  excludeId,
  placeholder = "Select a car from stock...",
}: {
  value?: string; // selected car's _id
  onSelect: (car: StockCar) => void;
  excludeId?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [cars, setCars] = useState<StockCar[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    carService
      .getAll({ status: "Available", limit: 200, sort: "-dateAdded" })
      .then(async (res) => {
        if (!active) return;
        let list: StockCar[] = res?.data || [];

        // FIX: when editing an existing exchange, the previously-selected
        // showroom car was already flipped to status "Reserved" by
        // createExchange, so it never shows up in the "Available" list
        // above — the combobox then has nothing to match `value` against
        // and looks empty. Fetch that specific car directly and make sure
        // it's included regardless of its current status.
        if (value && !list.some((c) => c._id === value)) {
          if (typeof carService.getById === "function") {
            try {
              const single = await carService.getById(value);
              if (single?.data) list = [single.data, ...list];
            } catch (err) {
              console.error("Failed to load currently selected stock car:", err);
            }
          } else {
            console.warn(
              "carService.getById is not defined — the currently selected showroom car can't be shown if it's not 'Available'. Add a getById method to carService.",
            );
          }
        }

        if (active) setCars(list);
      })
      .catch((err) => console.error("Failed to load stock cars:", err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [value]);

  const options = cars.filter((c) => c._id !== excludeId);
  const selected = options.find((c) => c._id === value);

  const label = (c: StockCar) =>
    `${c.company} ${c.model}${c.variant ? ` ${c.variant}` : ""} ${c.year}${
      c.registrationNumber
        ? ` (${c.registrationNumber})`
        : c.localNumber
          ? ` (${c.localNumber})`
          : ""
    }`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-xl font-normal"
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <CarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            {selected ? label(selected) : loading ? "Loading stock..." : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search by company, model or registration..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading..." : "No available cars found in stock."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((car) => (
                <CommandItem
                  key={car._id}
                  value={label(car)}
                  onSelect={() => {
                    onSelect(car);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === car._id ? "opacity-100" : "opacity-0")}
                  />
                  <span className="truncate">{label(car)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
