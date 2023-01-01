export function getTimestampDifference(foundTimestamp){
    const currTime = new Date().getTime()/1000;
    const timeDifference = Math.floor(currTime-foundTimestamp);
    
    if(timeDifference<0){
        return "0sec ago"
    }

    if(timeDifference < 60){    // 1-59secs
        return `${timeDifference}secs ago`;
    }
    else{
        const timeDiff_in_minutes = Math.floor(timeDifference/60);
        if(timeDiff_in_minutes<60){     // 1-59mins
            const unit = timeDiff_in_minutes === 1 ?"min":"mins";
            return `${timeDiff_in_minutes}${unit} ago`;
        }
        else{
            const timeDiff_in_hours = Math.floor(timeDiff_in_minutes/60);   // 1-23hrs
            if(timeDiff_in_hours < 24){
                const unit = timeDiff_in_hours === 1 ?"hour":"hours";
                return `${timeDiff_in_hours}${unit} ago`;
            }
            else{
                const timeDiff_in_days = Math.floor(timeDiff_in_hours/24);  // 1-29days
                if(timeDiff_in_days < 30){
                    const unit = timeDiff_in_days === 1 ?"day":"days";
                    return `${timeDiff_in_days}${unit} ago`;
                }
                else{
                    const timeDiff_in_months = Math.floor(timeDiff_in_days/30); // 1-11months
                    if(timeDiff_in_months < 12){
                        const unit = timeDiff_in_months === 1 ?"month":"months";
                        return `${timeDiff_in_months}${unit} ago`;
                    }
                    else{
                        const timeDiff_in_years = Math.floor(timeDiff_in_months/12); // 1-...years
                        const unit = timeDiff_in_years === 1 ?"year":"years";
                        return `${timeDiff_in_years}${unit} ago`;
                    }
                }
            }
        }
    }
}
export function getTimestampDifference_inSeconds(foundTimestamp){
    const currTime = new Date().getTime()/1000;
    const timeDifference = Math.floor(currTime-foundTimestamp);
    return timeDifference;
}