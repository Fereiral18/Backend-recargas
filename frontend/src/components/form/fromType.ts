import { ChangeEvent } from "react";

export interface Config {
 
    labelId: string | undefined;
    labelText:string
    type?: string;
    value?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    children?: React.ReactNode;
    link?: {
      linkText: string;
      linkUrl: string;
    };
    placeholder?: string;
    required?: boolean;
    icon?: any;
  }