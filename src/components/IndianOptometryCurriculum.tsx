
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from 'lucide-react';
import { toast } from 'sonner';

// Define types for the curriculum structure
interface CurriculumTopic {
  id: string;
  name: string;
  description?: string;
}

interface CurriculumUnit {
  id: string;
  name: string;
  topics: CurriculumTopic[];
}

interface CurriculumSemester {
  id: string;
  name: string;
  units: CurriculumUnit[];
}

interface CurriculumYear {
  id: string;
  name: string;
  semesters: CurriculumSemester[];
}

// Sample data for the Indian Optometry Curriculum (5 years program)
const indianOptometryCurriculum: CurriculumYear[] = [
  {
    id: 'year-1',
    name: 'First Year',
    semesters: [
      {
        id: 'sem-1',
        name: 'Semester 1',
        units: [
          {
            id: 'unit-1-1',
            name: 'Basic Sciences',
            topics: [
              { id: 'topic-1-1-1', name: 'Human Anatomy & Physiology' },
              { id: 'topic-1-1-2', name: 'Biochemistry' },
              { id: 'topic-1-1-3', name: 'Microbiology' }
            ]
          },
          {
            id: 'unit-1-2',
            name: 'Ocular Anatomy',
            topics: [
              { id: 'topic-1-2-1', name: 'Eyeball Structure' },
              { id: 'topic-1-2-2', name: 'Extraocular Muscles' },
              { id: 'topic-1-2-3', name: 'Orbital Anatomy' }
            ]
          }
        ]
      },
      {
        id: 'sem-2',
        name: 'Semester 2',
        units: [
          {
            id: 'unit-2-1',
            name: 'Basic Optics',
            topics: [
              { id: 'topic-2-1-1', name: 'Geometrical Optics' },
              { id: 'topic-2-1-2', name: 'Physical Optics' },
              { id: 'topic-2-1-3', name: 'Optical Instruments' }
            ]
          },
          {
            id: 'unit-2-2',
            name: 'Visual Optics',
            topics: [
              { id: 'topic-2-2-1', name: 'Refractive Errors' },
              { id: 'topic-2-2-2', name: 'Accommodation' },
              { id: 'topic-2-2-3', name: 'Visual Acuity' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'year-2',
    name: 'Second Year',
    semesters: [
      {
        id: 'sem-3',
        name: 'Semester 3',
        units: [
          {
            id: 'unit-3-1',
            name: 'Ocular Physiology',
            topics: [
              { id: 'topic-3-1-1', name: 'Tear Film Physiology' },
              { id: 'topic-3-1-2', name: 'Aqueous Humor Dynamics' },
              { id: 'topic-3-1-3', name: 'Pupillary Responses' }
            ]
          },
          {
            id: 'unit-3-2',
            name: 'Clinical Optometry I',
            topics: [
              { id: 'topic-3-2-1', name: 'Refraction Techniques' },
              { id: 'topic-3-2-2', name: 'Retinoscopy' },
              { id: 'topic-3-2-3', name: 'Subjective Refraction' }
            ]
          }
        ]
      },
      {
        id: 'sem-4',
        name: 'Semester 4',
        units: [
          {
            id: 'unit-4-1',
            name: 'Contact Lenses I',
            topics: [
              { id: 'topic-4-1-1', name: 'Soft Contact Lenses' },
              { id: 'topic-4-1-2', name: 'RGP Lenses' },
              { id: 'topic-4-1-3', name: 'Contact Lens Care' }
            ]
          },
          {
            id: 'unit-4-2',
            name: 'Ocular Diseases I',
            topics: [
              { id: 'topic-4-2-1', name: 'Anterior Segment Disorders' },
              { id: 'topic-4-2-2', name: 'Lid and Adnexa Disorders' },
              { id: 'topic-4-2-3', name: 'Conjunctival Diseases' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'year-3',
    name: 'Third Year',
    semesters: [
      {
        id: 'sem-5',
        name: 'Semester 5',
        units: [
          {
            id: 'unit-5-1',
            name: 'Binocular Vision',
            topics: [
              { id: 'topic-5-1-1', name: 'Vergence Systems' },
              { id: 'topic-5-1-2', name: 'Accommodation and Convergence' },
              { id: 'topic-5-1-3', name: 'Stereopsis' }
            ]
          },
          {
            id: 'unit-5-2',
            name: 'Ocular Diseases II',
            topics: [
              { id: 'topic-5-2-1', name: 'Corneal Disorders' },
              { id: 'topic-5-2-2', name: 'Glaucoma' },
              { id: 'topic-5-2-3', name: 'Lens Disorders' }
            ]
          }
        ]
      },
      {
        id: 'sem-6',
        name: 'Semester 6',
        units: [
          {
            id: 'unit-6-1',
            name: 'Contact Lenses II',
            topics: [
              { id: 'topic-6-1-1', name: 'Specialty Contact Lenses' },
              { id: 'topic-6-1-2', name: 'Orthokeratology' },
              { id: 'topic-6-1-3', name: 'Contact Lens Complications' }
            ]
          },
          {
            id: 'unit-6-2',
            name: 'Low Vision',
            topics: [
              { id: 'topic-6-2-1', name: 'Low Vision Assessment' },
              { id: 'topic-6-2-2', name: 'Low Vision Aids' },
              { id: 'topic-6-2-3', name: 'Vision Rehabilitation' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'year-4',
    name: 'Fourth Year',
    semesters: [
      {
        id: 'sem-7',
        name: 'Semester 7',
        units: [
          {
            id: 'unit-7-1',
            name: 'Pediatric Optometry',
            topics: [
              { id: 'topic-7-1-1', name: 'Pediatric Eye Examination' },
              { id: 'topic-7-1-2', name: 'Amblyopia' },
              { id: 'topic-7-1-3', name: 'Vision Therapy' }
            ]
          },
          {
            id: 'unit-7-2',
            name: 'Ocular Diseases III',
            topics: [
              { id: 'topic-7-2-1', name: 'Retinal Disorders' },
              { id: 'topic-7-2-2', name: 'Uveitis' },
              { id: 'topic-7-2-3', name: 'Neuro-ophthalmology' }
            ]
          }
        ]
      },
      {
        id: 'sem-8',
        name: 'Semester 8',
        units: [
          {
            id: 'unit-8-1',
            name: 'Geriatric Optometry',
            topics: [
              { id: 'topic-8-1-1', name: 'Age-related Visual Changes' },
              { id: 'topic-8-1-2', name: 'Age-related Eye Diseases' },
              { id: 'topic-8-1-3', name: 'Visual Rehabilitation for Elderly' }
            ]
          },
          {
            id: 'unit-8-2',
            name: 'Public Health Optometry',
            topics: [
              { id: 'topic-8-2-1', name: 'Epidemiology' },
              { id: 'topic-8-2-2', name: 'Vision Screening' },
              { id: 'topic-8-2-3', name: 'Community Eye Care' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'year-5',
    name: 'Fifth Year',
    semesters: [
      {
        id: 'sem-9',
        name: 'Semester 9',
        units: [
          {
            id: 'unit-9-1',
            name: 'Advanced Clinical Optometry',
            topics: [
              { id: 'topic-9-1-1', name: 'Advanced Contact Lens Fitting' },
              { id: 'topic-9-1-2', name: 'Advanced Binocular Vision Assessment' },
              { id: 'topic-9-1-3', name: 'Clinical Decision Making' }
            ]
          },
          {
            id: 'unit-9-2',
            name: 'Research Methodology',
            topics: [
              { id: 'topic-9-2-1', name: 'Research Design' },
              { id: 'topic-9-2-2', name: 'Biostatistics' },
              { id: 'topic-9-2-3', name: 'Scientific Writing' }
            ]
          }
        ]
      },
      {
        id: 'sem-10',
        name: 'Semester 10',
        units: [
          {
            id: 'unit-10-1',
            name: 'Clinical Internship',
            topics: [
              { id: 'topic-10-1-1', name: 'Comprehensive Eye Examination' },
              { id: 'topic-10-1-2', name: 'Clinical Case Management' },
              { id: 'topic-10-1-3', name: 'Patient Communication' }
            ]
          },
          {
            id: 'unit-10-2',
            name: 'Practice Management',
            topics: [
              { id: 'topic-10-2-1', name: 'Optometric Practice Setup' },
              { id: 'topic-10-2-2', name: 'Ethics in Optometry' },
              { id: 'topic-10-2-3', name: 'Professional Development' }
            ]
          }
        ]
      }
    ]
  }
];

interface IndianOptometryCurriculumProps {
  onTopicSelect: (topic: string, subject: string) => void;
}

const IndianOptometryCurriculum: React.FC<IndianOptometryCurriculumProps> = ({ onTopicSelect }) => {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Array<{topic: string, path: string}>>([]);

  // Get available options based on current selection
  const getAvailableSemesters = () => {
    if (!selectedYear) return [];
    const year = indianOptometryCurriculum.find(y => y.id === selectedYear);
    return year ? year.semesters : [];
  };

  const getAvailableUnits = () => {
    if (!selectedYear || !selectedSemester) return [];
    const year = indianOptometryCurriculum.find(y => y.id === selectedYear);
    if (!year) return [];
    const semester = year.semesters.find(s => s.id === selectedSemester);
    return semester ? semester.units : [];
  };

  const getAvailableTopics = () => {
    if (!selectedYear || !selectedSemester || !selectedUnit) return [];
    const year = indianOptometryCurriculum.find(y => y.id === selectedYear);
    if (!year) return [];
    const semester = year.semesters.find(s => s.id === selectedSemester);
    if (!semester) return [];
    const unit = semester.units.find(u => u.id === selectedUnit);
    return unit ? unit.topics : [];
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setSelectedSemester("");
    setSelectedUnit("");
    setSelectedTopic("");
  };

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    setSelectedUnit("");
    setSelectedTopic("");
  };

  const handleUnitChange = (value: string) => {
    setSelectedUnit(value);
    setSelectedTopic("");
  };

  const handleTopicChange = (value: string) => {
    setSelectedTopic(value);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: Array<{topic: string, path: string}> = [];

    // Search through the curriculum
    indianOptometryCurriculum.forEach(year => {
      year.semesters.forEach(semester => {
        semester.units.forEach(unit => {
          unit.topics.forEach(topic => {
            if (topic.name.toLowerCase().includes(query)) {
              results.push({
                topic: topic.name,
                path: `${year.name} > ${semester.name} > ${unit.name}`
              });
            }
          });
        });
      });
    });

    setSearchResults(results);
    
    if (results.length === 0) {
      toast.info("No topics found matching your search");
    }
  };

  const handleGenerateNotes = () => {
    if (!selectedTopic) {
      toast.error("Please select a topic first");
      return;
    }

    const topic = getAvailableTopics().find(t => t.id === selectedTopic);
    if (!topic) return;

    const unit = getAvailableUnits().find(u => u.id === selectedUnit);
    if (!unit) return;

    onTopicSelect(topic.name, unit.name);
    toast.success(`Generating notes for ${topic.name}`);
  };

  const handleSelectSearchResult = (topic: string, path: string) => {
    onTopicSelect(topic, path.split(' > ')[2]);
    toast.success(`Generating notes for ${topic}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Indian Optometry Curriculum Explorer</CardTitle>
        <CardDescription>
          Explore the standardized 5-year BSc Optometry curriculum and generate study notes on any topic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <h3 className="text-md font-medium">Browse by Syllabus Structure:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianOptometryCurriculum.map(year => (
                      <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={selectedSemester} 
                  onValueChange={handleSemesterChange}
                  disabled={!selectedYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSemesters().map(semester => (
                      <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={selectedUnit} 
                  onValueChange={handleUnitChange}
                  disabled={!selectedSemester}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableUnits().map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={selectedTopic} 
                  onValueChange={handleTopicChange}
                  disabled={!selectedUnit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTopics().map(topic => (
                      <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateNotes} 
              disabled={!selectedTopic} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Generate Notes from Selected Topic
            </Button>
            
            <div className="relative mt-6">
              <h3 className="text-md font-medium mb-2">Search Curriculum:</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search for topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Search Results:</h4>
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {searchResults.map((result, index) => (
                    <div 
                      key={index} 
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSelectSearchResult(result.topic, result.path)}
                    >
                      <div className="font-medium">{result.topic}</div>
                      <div className="text-xs text-gray-500">{result.path}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 pt-3 pb-3">
        <p className="text-xs text-gray-500">
          Based on India's standardized national optometry curriculum - One Nation, One Syllabus
        </p>
      </CardFooter>
    </Card>
  );
};

export default IndianOptometryCurriculum;
