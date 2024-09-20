import { css } from "lit";

export const button = css`
button {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    font-weight: 400;
    line-height: 1.5;

    text-align: center;
    text-decoration: none;
    vertical-align: middle;

    cursor: pointer;
    user-select: none;

    border-radius: 0.25rem;
    box-shadow: none;

    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

    &:active {
        outline: 0;
        box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    }

    &:disabled {
        opacity: 0.65;
    }

    &:focus-visible {
        outline: 0;
        box-shadow: 0 0 0 0.25rem rgba(49, 132, 253, .5);
    }
}
`;

export const buttonPrimary = css`
button {
    color: #fff;
    background-color: #0d6efd;
    border: 1px solid #0d6efd;

    &:hover {
        background-color: #0b5ed7;
        border-color: #0a58ca;
    }
    
    &:active {
        background-color: #0b5ed7;
        border-color: #0a53be;
    }
}
`;

export const buttonSecondary = css`
button {
    color: #fff;
    background-color: #6c757d;
    border: 1px solid #6c757d;

    &:hover 
        background-color: #5c636a;
        border-color: #565e64;
  
    &:active 
        background-color: #565e64;
        border-color: #4e555b;
}
`;

export const buttonSmall = css`
button {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
}
`;
