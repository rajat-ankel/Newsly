import React from "react";

const TextItem = (props) => {
    const { result } = props;
    
    return (
        <React.Fragment>{`## ${result.title}\n\n${result.description ? result.description : result.desc}\n\n[link](${result.link})\n\n\n`}</React.Fragment>
    );
};

export default TextItem;
