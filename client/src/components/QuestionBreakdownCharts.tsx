import { Card } from '@/components/ui/card';
import { useTopicAnalytics } from '@/hooks/useTopicAnalytics';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS_ANSWERED = ['#10b981', '#ef4444'];
const COLORS_CORRECT = ['#3b82f6', '#ef4444'];

export function QuestionBreakdownCharts() {
  const { topics } = useTopicAnalytics();
  const { getAllStats } = useQuestionStats();
  const stats = getAllStats();

  // Calculate overall answered vs unanswered
  const overallBreakdown = useMemo(() => {
    const totalQuestions = 500; // Approximate total questions in the system
    const answered = stats.total;
    const unanswered = Math.max(0, totalQuestions - answered);
    return [
      { name: 'Answered', value: answered, fill: '#10b981' },
      { name: 'Unanswered', value: unanswered, fill: '#e5e7eb' },
    ];
  }, [stats.total]);

  // Calculate correct vs incorrect from answered
  const correctBreakdown = useMemo(() => {
    const correct = stats.correct || 0;
    const incorrect = (stats.total || 0) - correct;
    return [
      { name: 'Correct', value: correct, fill: '#3b82f6' },
      { name: 'Incorrect', value: incorrect, fill: '#ef4444' },
    ];
  }, [stats]);

  // Calculate by topic breakdown
  const topicAnswered = useMemo(() => {
    return topics.map(t => ({
      name: t.sectionId,
      value: t.total,
      fill: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }));
  }, [topics]);

  const topicCorrect = useMemo(() => {
    return topics.map(t => ({
      name: t.sectionId,
      value: t.correct,
      fill: `hsl(${Math.random() * 360}, 70%, 60%)`,
    })).filter(t => t.value > 0);
  }, [topics]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Answered vs Unanswered */}
      <Card variant="glass" className="p-6 glow-primary transition-glow flex flex-col">
        <h3 className="text-lg font-semibold mb-4 gradient-text">Questions Answered</h3>
        <div className="flex-1 flex items-center justify-center">
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={overallBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {overallBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#ffffff',
                    padding: '8px 12px'
                  }}
                  formatter={(value: any) => value.toLocaleString()}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center">No Data Yet</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-4">
          <div className="text-center">
            <p className="text-muted-foreground">Answered</p>
            <p className="text-lg font-bold text-success">{stats.total}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Remaining</p>
            <p className="text-lg font-bold text-muted-foreground">{Math.max(0, 500 - stats.total)}</p>
          </div>
        </div>
      </Card>

      {/* Correct vs Incorrect */}
      <Card variant="glass" className="p-6 glow-accent transition-glow flex flex-col">
        <h3 className="text-lg font-semibold mb-4 gradient-text">Accuracy</h3>
        <div className="flex-1 flex items-center justify-center">
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={correctBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {correctBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#ffffff',
                    padding: '8px 12px'
                  }}
                  formatter={(value: any) => value.toLocaleString()}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center">No Data Yet</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-4">
          <div className="text-center">
            <p className="text-muted-foreground">Correct</p>
            <p className="text-lg font-bold text-success">{stats.correct || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Incorrect</p>
            <p className="text-lg font-bold text-destructive">{(stats.total || 0) - (stats.correct || 0)}</p>
          </div>
        </div>
      </Card>

      {/* By Topic - Questions Answered */}
      {topicAnswered.length > 0 && (
        <Card variant="glass" className="p-6 glow-primary transition-glow flex flex-col">
          <h3 className="text-lg font-semibold mb-4 gradient-text">Questions - Topic</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topicAnswered}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value.toLocaleString()}
                  outerRadius={80}
                  dataKey="value"
                >
                  {topicAnswered.map((entry, index) => (
                    <Cell key={`topic-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#ffffff',
                    padding: '8px 12px'
                  }}
                  formatter={(value: any) => value.toLocaleString()}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* By Topic - Correct Answers */}
      {topicCorrect.length > 0 && (
        <Card variant="glass" className="p-6 glow-accent transition-glow flex flex-col">
          <h3 className="text-lg font-semibold mb-4 gradient-text">Correct - Topic</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topicCorrect}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value.toLocaleString()}
                  outerRadius={80}
                  dataKey="value"
                >
                  {topicCorrect.map((entry, index) => (
                    <Cell key={`correct-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#ffffff',
                    padding: '8px 12px'
                  }}
                  formatter={(value: any) => value.toLocaleString()}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
