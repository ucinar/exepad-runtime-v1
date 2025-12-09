import { ComponentProps, ImageProps, TextProps, HeadingProps } from "../../common/core";
import { SocialLinkProps } from "./content";

/**
 * A profile block for a single team member, with multiple style variants.
 */
export interface TeamMemberProps extends ComponentProps {
    /** URL to the team member's photo. */
    photo: ImageProps;
    /** Team member's full name. */
    name: HeadingProps;
    /** Team member's position or role in the company. */
    position?: TextProps;
    /** A short biography or description for the team member. */
    bio?: TextProps;
    /** A list of social media links for the team member. */
    socialLinks?: SocialLinkProps[];

    /**
     * Defines the visual presentation and layout of the team member item.
     * - `cardVertical`: A standard card with content arranged vertically.
     * - `cardHorizontal`: A card with the image on the left and content on the right.
     * - `avatarVertical`: A style with a circular avatar and centered text below, no card.
     * - `avatarHorizontal`: A style with a circular avatar on the left and text on the right, no card.
     * - `imageOverlay`: A style where the name and role are overlaid on the photo.
     * @default 'cardVertical'
     */
    style?: 'cardVertical' | 'cardHorizontal' | 'avatarVertical' | 'avatarHorizontal' | 'imageOverlay';
}
