    // features/progress/HistoryView.jsx
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../shared/db/db';

const HistoryView = ({ selectedExercise }) => {
    // Sadece seçili egzersizin loglarını tarih sırasına göre çeker
    const exerciseLogs = useLiveQuery(
        () => db.weightLogs
                .where('exerciseName')
                .equals(selectedExercise)
                .reverse() // En yeniler üstte
                .sortBy('date'),
        [selectedExercise] // Bağımlılık dizisi
    );

    if (!exerciseLogs) return <LoadingSpinner />;

    return (
        <ul>
            {exerciseLogs.map(log => (
                <li key={log.id}>
                    {log.date}: {log.weight}kg x {log.reps} (1RM: {log.e1rm})
                </li>
            ))}
        </ul>
    );
};