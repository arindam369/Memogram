import SkeletonElement from "./SkeletonElement";
import styles from "./../styles/Home.module.css";

export default function SkeletonPost(){
    return (
        <>
            {/* <div className="skeletonContainer"> */}
            <div className={styles.post}>
                <div className="skeletonHead">
                    <SkeletonElement skeletonType="dp"/>
                    <div>
                        <SkeletonElement skeletonType="fullname"/>
                        <SkeletonElement skeletonType="email"/>
                    </div>
                </div>
                <div className="skeletonBody">
                    <SkeletonElement skeletonType="postImage"/>
                </div>
                <div className="skeletonFooter">
                    <SkeletonElement skeletonType="caption"/>
                    <div className="skeleton__loveCommentShare">
                        <SkeletonElement skeletonType="love"/>
                        <SkeletonElement skeletonType="comment"/>
                        <SkeletonElement skeletonType="share"/>
                    </div>
                </div>
            </div>
        </>
    );
}