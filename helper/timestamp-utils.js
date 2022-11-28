export function getTimestampDifference(foundTimestamp){
    const currTime = new Date().getTime()/1000;
    const timeDifference = Math.floor(currTime-foundTimestamp);
    if(timeDifference<0){
        return "0s ago"
    }

    if(timeDifference < 60){
        return `${timeDifference}s ago`;
    }
    else{
        const timeDiff_in_minutes = Math.floor(timeDifference/60);
        if(timeDiff_in_minutes<60){
            const unit = timeDiff_in_minutes === 1 ?"min":"mins";
            return `${timeDiff_in_minutes}${unit} ago`;
        }
        else{
            const timeDiff_in_hours = Math.floor(timeDiff_in_minutes/60)
            if(timeDiff_in_hours < 24){
                const unit = timeDiff_in_hours === 1 ?"hour":"hours";
                return `${timeDiff_in_hours}${unit} ago`;
            }
            else{
                const timeDiff_in_days = Math.floor(timeDiff_in_hours/24);
                if(timeDiff_in_days < 30){
                    const unit = timeDiff_in_days === 1 ?"day":"days";
                    return `${timeDiff_in_days}${unit} ago`;
                }
                else{
                    const timeDiff_in_months = Math.floor(timeDiff_in_days/30);
                    if(timeDiff_in_hours < 12){
                        const unit = timeDiff_in_months === 1 ?"month":"months";
                        return `${timeDiff_in_months}${unit} ago`;
                    }
                    else{
                        const timeDiff_in_years = Math.floor(timeDiff_in_months/12);
                        const unit = timeDiff_in_years === 1 ?"year":"years";
                        return `${timeDiff_in_years}${unit} ago`;
                    }
                }
            }
        }
    }
}