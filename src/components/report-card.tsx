import { GoTable } from 'react-icons/go';
import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface ReportCardProps {
    icon?: ReactNode;
    title: string;
    link: string;
    description: string;
    tags: string[];
}

function ReportCard({ icon, title, link, description, tags }: ReportCardProps) {
    return (
        <div
            className="flex min-h-34.5 max-w-140 min-w-[288px] flex-col justify-between gap-4 rounded-lg border
                border-(--border-primary) p-4"
        >
            <div className="flex h-8 items-center gap-2 p-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ebf6ff]">
                    {icon || <GoTable size={16} />}
                </div>
                <Link to={link} className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{title}</h3>
                    <ChevronRightIcon size={16} />
                </Link>
            </div>
            <div className="flex flex-col">
                <div>
                    <p className="text-xs leading-6 text-[#4e677e]">{description}</p>
                </div>
                <div className="flex h-12 items-end">
                    <div className="flex w-full justify-end gap-1">
                        {tags.map((tag, index) => (
                            <div
                                key={index}
                                className="flex h-5.5 items-center justify-center rounded-full bg-[#f2f5f7] px-2 text-xs
                                    leading-4"
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportCard;
