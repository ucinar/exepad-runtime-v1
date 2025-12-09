// src/interfaces/apps/landing.ts

import { AppProps,LayoutOption,ThemeProps, MenuPosition, LanguageOption } from './core';
import { ComponentProps } from '../components/common/core';
import { TransitionConfig } from './transitions';
import {PageProps} from "./page";
export * from './core';


/** Web App schema */
export interface WebAppProps extends AppProps{
    /** Application alias, unique and URL-friendly, at least six characters long */
    alias: string;
  
    /** Supported languages for the webapp */
    languages: LanguageOption[];
  
    /** Layout configuration for the webapp */
    layout: LayoutOption;

    /** Menu position */
    menuPosition: MenuPosition;

    /** Theme configuration - Mandatory */
    theme: ThemeProps;

    /** Sidebar component configuration */
    sidebar: ComponentProps[];

    /** Header component configuration */
    header: ComponentProps[];

    /** Array of pages in the webapp */
    pages: PageProps[];

    /** Footer component configuration */
    footer: ComponentProps[];

    /** Global transition configuration */
    transitions?: TransitionConfig;
}
