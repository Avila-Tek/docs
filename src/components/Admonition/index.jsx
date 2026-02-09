import React from 'react';
import Admonition from '@theme/Admonition';

export default function CustomAdmonition(props) {
    const title = props.title || '';
    const type = props.type || 'note';
    const children = props.children || '';

    return (
        <Admonition type={type} title={title}>
            {children}
        </Admonition>
    );
}