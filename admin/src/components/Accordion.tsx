import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, children, defaultOpen = true }: AccordionProps) {
  return (
    <div className="w-full">
      <Disclosure defaultOpen={defaultOpen}>
        {({ open }) => (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <DisclosureButton className="w-full flex justify-between items-center px-8 py-4 text-left focus:outline-none hover:bg-gray-50 transition-colors border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {title}
              </h3>
              <ChevronDown
                className={`${
                  open ? "transform rotate-180" : ""
                } w-5 h-5 text-gray-500 transition-transform duration-200`}
              />
            </DisclosureButton>

            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <DisclosurePanel className="px-8 py-6 space-y-6">
                {children}
              </DisclosurePanel>
            </Transition>
          </div>
        )}
      </Disclosure>
    </div>
  );
}
