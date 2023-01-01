import React from "react";

export default function SkeletonElement({skeletonType}){
    const skeletonClasses = `skeleton skeleton__${skeletonType}`
    return (
        <>
            <div className={skeletonClasses}/>
        </>
    );
}