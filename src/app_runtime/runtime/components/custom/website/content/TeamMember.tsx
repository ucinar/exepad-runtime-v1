import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Assuming shadcn/ui paths and lucide-react for icons
import { Card, CardContent } from "@/runtime/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/runtime/components/ui/avatar";
import { Facebook, Twitter, Github, Dribbble, Linkedin } from "lucide-react";

// Assuming interfaces are in this path, adjust as needed
import { 
    TeamMemberProps, 
} from '@/interfaces/components/website/content/team_member';
import { SocialLinkProps } from '@/interfaces/components/website/content/content';
import { cn } from '@/lib/utils';
import { DynamicRenderer } from '@/components/DynamicRenderer';
import { ComponentProps } from '@/interfaces/components/common/core';


// --- Helper & Placeholder Components ---

/**
 * Maps social platform names to their respective icon components.
 */
const socialIconMap: { [key: string]: React.ElementType } = {
    facebook: Facebook,
    twitter: Twitter,
    github: Github,
    dribbble: Dribbble,
    linkedin: Linkedin,
};

/**
 * Renders a list of social media icons from the socialLinks array.
 */
const SocialLinks = ({ links }: { links: SocialLinkProps[] }) => (
    <div className="flex items-center gap-1 mt-4">
        {links.map(link => {
            const IconComponent = socialIconMap[link.platform.toLowerCase()];
            // Render the link only if a corresponding icon exists
            if (!IconComponent) {
                return null;
            }
            return (
                <Link
                    key={link.uuid}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label || link.platform}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <IconComponent className="w-4 h-4 text-gray-600" />
                </Link>
            );
        })}
    </div>
);

// --- Main Component ---

/**
 * Renders a team member profile. It acts as a dispatcher, selecting the correct
 * sub-component based on the `style` property.
 */
export const TeamMember = ({
  style = 'cardVertical',
  ...props
}: TeamMemberProps) => {
  switch (style) {
    case 'cardHorizontal':
      return <TeamMemberCardHorizontal {...props} />;
    case 'avatarVertical':
      return <TeamMemberAvatarVertical {...props} />;
    case 'avatarHorizontal':
      return <TeamMemberAvatarHorizontal {...props} />;
    case 'imageOverlay':
        return <TeamMemberImageOverlay {...props} />;
    case 'cardVertical':
    default:
      return <TeamMemberCardVertical {...props} />;
  }
};


// --- Variant Implementations ---

/**
 * Style: A standard card with content arranged vertically.
 */
const TeamMemberCardVertical = (props: Omit<TeamMemberProps, 'style'>) => (
    <div className={cn("h-full overflow-hidden bg-gray-50 rounded-lg", props.classes)}>
        <div className="relative w-full aspect-square">
            <Image src={props.photo.src} alt={props.photo.alt} layout="fill" objectFit="cover" />
        </div>
        <div className="p-6">
            <DynamicRenderer component={{ ...props.name, classes: cn("text-2xl font-bold text-gray-900", props.name.classes) } as ComponentProps} />
            {props.position && (
                <div className="text-gray-500 mt-1">
                    <DynamicRenderer component={props.position as ComponentProps} />
                </div>
            )}
            {props.bio && (
                <div className="text-gray-600 mt-3 text-sm leading-relaxed">
                    <DynamicRenderer component={props.bio as ComponentProps} />
                </div>
            )}
            {props.socialLinks && <SocialLinks links={props.socialLinks} />}
        </div>
    </div>
);

/**
 * Style: A card with the image on the left and content on the right.
 */
const TeamMemberCardHorizontal = (props: Omit<TeamMemberProps, 'style'>) => (
    <div className={cn("flex items-center gap-6 p-6 bg-gray-50 rounded-lg", props.classes)}>
        <div className="relative w-32 h-32 flex-shrink-0">
            <Image src={props.photo.src} alt={props.photo.alt} layout="fill" objectFit="cover" className="rounded-lg" />
        </div>
        <div className="flex-grow">
            <DynamicRenderer component={{ ...props.name, classes: cn("text-2xl font-bold text-gray-900", props.name.classes) } as ComponentProps} />
            {props.position && (
                <div className="text-gray-500 mt-1">
                    <DynamicRenderer component={props.position as ComponentProps} />
                </div>
            )}
            {props.bio && (
                <div className="text-gray-600 mt-3 text-sm leading-relaxed">
                    <DynamicRenderer component={props.bio as ComponentProps} />
                </div>
            )}
            {props.socialLinks && <SocialLinks links={props.socialLinks} />}
        </div>
    </div>
);

/**
 * Style: A circular avatar with centered text below, no card.
 */
const TeamMemberAvatarVertical = (props: Omit<TeamMemberProps, 'style'>) => (
    <div className={cn("text-center p-4", props.classes)}>
        <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
            <AvatarImage src={props.photo.src} alt={props.photo.alt} />
            <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div className="mt-4">
            <DynamicRenderer component={{ ...props.name, classes: cn("text-xl font-bold text-gray-900", props.name.classes) } as ComponentProps} />
        </div>
        {props.position && (
            <div className="text-gray-500">
                <DynamicRenderer component={props.position as ComponentProps} />
            </div>
        )}
        {props.socialLinks && <div className="flex justify-center"><SocialLinks links={props.socialLinks} /></div>}
    </div>
);

/**
 * Style: A circular avatar on the left and text on the right, no card.
 */
const TeamMemberAvatarHorizontal = (props: Omit<TeamMemberProps, 'style'>) => (
    <div className={cn("flex items-center gap-6 p-4", props.classes)}>
        <Avatar className="w-24 h-24 flex-shrink-0 border-4 border-white shadow-lg">
            <AvatarImage src={props.photo.src} alt={props.photo.alt} />
            <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div>
            <DynamicRenderer component={{ ...props.name, classes: cn("text-xl font-bold text-gray-900", props.name.classes) } as ComponentProps} />
            {props.position && (
                <div className="text-gray-500">
                    <DynamicRenderer component={props.position as ComponentProps} />
                </div>
            )}
            {props.bio && (
                <div className="text-gray-600 mt-2">
                    <DynamicRenderer component={props.bio as ComponentProps} />
                </div>
            )}
            {props.socialLinks && <SocialLinks links={props.socialLinks} />}
        </div>
    </div>
);

/**
 * Style: Name and role are overlaid on the photo.
 */
const TeamMemberImageOverlay = (props: Omit<TeamMemberProps, 'style'>) => (
    <div className={cn("relative text-center h-full overflow-hidden group border rounded-lg shadow-sm", props.classes)}>
        <div className="absolute inset-0">
            <Image src={props.photo.src} alt={props.photo.alt} layout="fill" objectFit="cover" className="group-hover:scale-110 transition-transform duration-500"/>
        </div>
        <div className="relative flex flex-col justify-end items-center h-full p-6 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
            <div className="text-white">
                <DynamicRenderer component={{ ...props.name, classes: cn("text-xl font-bold", props.name.classes) } as ComponentProps} />
            </div>
            {props.position && (
                <div className="text-blue-300 font-semibold">
                    <DynamicRenderer component={props.position as ComponentProps} />
                </div>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {props.socialLinks && <SocialLinks links={props.socialLinks} />}
            </div>
        </div>
    </div>
);
