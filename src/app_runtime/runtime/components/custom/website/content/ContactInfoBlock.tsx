import * as React from 'react';
import { cn } from '@/lib/utils';
// Import DynamicRenderer instead of DynamicRendererList
import { DynamicRenderer } from '@/components/DynamicRenderer'; 
import { MapPin, Phone, Mail } from 'lucide-react';

// Assuming interfaces are imported from their respective files
import { ContactInfoBlockProps, SocialLinkProps } from '@/interfaces/components/website/content/content';

/**
 * Renders a contact information section, including details like address,
 * phone, email, social links, and an embedded map.
 * This component is SSR-compatible.
 */
export const ContactInfoBlock = ({
  title,
  address,
  phone,
  email,
  mapEmbed,
  socialLinks,
  classes,
}: ContactInfoBlockProps) => {
  // Check if we have any contact info to display
  const hasContactInfo = title || address || phone || email || (socialLinks && socialLinks.length > 0);
  
  // Use single column layout if only map is provided
  const gridClasses = hasContactInfo && mapEmbed 
    ? "grid grid-cols-1 md:grid-cols-2 gap-12 items-start" 
    : "flex flex-col items-center";

  // Helper function to auto-detect map provider and render accordingly
  const renderMap = () => {
    if (!mapEmbed) return null;

    // If mapEmbed contains HTML (starts with '<'), render it directly
    if (mapEmbed.startsWith('<')) {
      return (
        <div
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: mapEmbed }}
        />
      );
    }

    // Auto-detect map provider based on URL
    const isOpenStreetMap = mapEmbed.includes('openstreetmap.org');
    const isGoogleMaps = mapEmbed.includes('google.com/maps') || mapEmbed.includes('maps.google.com');
    
    if (isOpenStreetMap) {
      // OpenStreetMap detected
      return (
        <iframe
          src={mapEmbed}
          width="100%"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          className="w-full h-full"
          title="OpenStreetMap Location"
        />
      );
    } else if (isGoogleMaps) {
      // Google Maps detected
      return (
        <iframe
          src={mapEmbed}
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
          title="Google Maps Location"
        />
      );
    } else {
      // Unknown provider - use generic iframe (fallback)
      return (
        <iframe
          src={mapEmbed}
          width="100%"
          height="450"
          style={{ border: 0 }}
          loading="lazy"
          className="w-full h-full"
          title="Map Location"
        />
      );
    }
  };

  return (
    <div className={cn(gridClasses, classes)}>
      {/* Left side: Contact Info - only render if we have contact info */}
      {hasContactInfo && (
        <div className="space-y-8">
        {title && <h2 className="text-3xl font-bold tracking-tight">{title}</h2>}
        
        <div className="space-y-4 text-gray-700">
          {address && (
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <p className="leading-relaxed">{address}</p>
            </div>
          )}
          {phone && (
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
            </div>
          )}
          {email && (
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <a href={`mailto:${email}`} className="hover:underline">{email}</a>
            </div>
          )}
        </div>

        {socialLinks && socialLinks.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-lg">Follow Us</h3>
            {/* FIX: Map over the socialLinks array directly inside the flex container. */}
            {/* This makes each rendered social link a direct child of the flex div, */}
            {/* allowing them to be arranged in a row with a gap. */}
            <div className="flex items-center gap-4">
                {socialLinks.map((link: SocialLinkProps) => (
                    <DynamicRenderer key={link.uuid} component={link} />
                ))}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Embedded Map - takes full width when no contact info */}
      {mapEmbed && (
        <div className={cn(
          "overflow-hidden rounded-lg border w-full",
          hasContactInfo ? "aspect-w-16 aspect-h-9" : "h-96 max-w-4xl"
        )}>
          {renderMap()}
        </div>
      )}
    </div>
  );
};
