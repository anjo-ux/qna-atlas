import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import * as XLSX from 'xlsx';
import { Section, Question } from '@/types/question';
import { TestMode } from './TestMode';
import { getPreviewQuestions } from '@/utils/previewQuestions';

export default function PreviewMode() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/questions.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const groupedData: Record<string, Record<string, Question[]>> = {};
        
        data.forEach((row: any) => {
          const section = row['Section'] || 'Unknown';
          const subsection = row['Subsection'] || 'General';
          const question: Question = {
            id: row['ID'] || '',
            question: row['Question'] || '',
            answer: row['Correct Answer'] || 'A',
            category: section,
            subcategory: subsection,
            tags: [],
          };

          if (!groupedData[section]) {
            groupedData[section] = {};
          }
          if (!groupedData[section][subsection]) {
            groupedData[section][subsection] = [];
          }
          groupedData[section][subsection].push(question);
        });

        const sections: Section[] = Object.entries(groupedData).map(([sectionName, subsections]) => ({
          id: sectionName.toLowerCase().replace(/\s+/g, '-'),
          title: sectionName,
          subsections: Object.entries(subsections).map(([subsectionName, questions]) => ({
            id: `${sectionName.toLowerCase().replace(/\s+/g, '-')}-${subsectionName.toLowerCase().replace(/\s+/g, '-')}`,
            title: subsectionName,
            questions,
          })),
        }));

        setSections(sections);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading preview test...</p>
        </div>
      </div>
    );
  }

  const previewQuestions = getPreviewQuestions(sections);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <TestMode 
        sections={sections}
        previewQuestions={previewQuestions}
        onBack={() => navigate('/')}
        isPreview={true}
      />
    </div>
  );
}
