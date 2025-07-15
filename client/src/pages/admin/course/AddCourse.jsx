import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, { data, isLoading, error, isSuccess }] =
    useCreateCourseMutation();

  const navigate = useNavigate();

  const getSelectedCategory = (value) => {
    setCategory(value);
  };

  const createCourseHandler = async () => {
    await createCourse({ courseTitle, category });
  };

  // for displaying toast
  useEffect(()=>{
    if(isSuccess){
        toast.success(data?.message || "Course created.");
        navigate("/admin/course");
    }
  },[isSuccess, error])

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Lets add course, add some basic course details for your new course
        </h1>
        <p className="text-sm">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus,
          laborum!
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="Your Course Name"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select onValueChange={getSelectedCategory}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {/* TECH */}
              <SelectGroup>
                <SelectLabel>Tech</SelectLabel>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Frontend Development">
                  Frontend Development
                </SelectItem>
                <SelectItem value="Backend Development">
                  Backend Development
                </SelectItem>
                <SelectItem value="Fullstack Development">
                  Fullstack Development
                </SelectItem>
                <SelectItem value="MERN Stack">MERN Stack</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Machine Learning">
                  Machine Learning
                </SelectItem>
                <SelectItem value="AI & Deep Learning">
                  AI & Deep Learning
                </SelectItem>
                <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="Ethical Hacking">Ethical Hacking</SelectItem>
                <SelectItem value="Blockchain">Blockchain</SelectItem>
                <SelectItem value="Networking">Networking</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
                <SelectItem value="Mobile App Development">
                  Mobile App Development
                </SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                <SelectItem value="Game Development">
                  Game Development
                </SelectItem>
              </SelectGroup>

              {/* AGRICULTURE */}
              <SelectGroup>
                <SelectLabel>Agriculture</SelectLabel>
                <SelectItem value="Organic Farming">Organic Farming</SelectItem>
                <SelectItem value="Precision Agriculture">
                  Precision Agriculture
                </SelectItem>
                <SelectItem value="Aquaculture">Aquaculture</SelectItem>
                <SelectItem value="Animal Husbandry">
                  Animal Husbandry
                </SelectItem>
                <SelectItem value="Agroforestry">Agroforestry</SelectItem>
                <SelectItem value="Soil Science">Soil Science</SelectItem>
                <SelectItem value="Agricultural Machinery">
                  Agricultural Machinery
                </SelectItem>
              </SelectGroup>

              {/* COOKING */}
              <SelectGroup>
                <SelectLabel>Cooking</SelectLabel>
                <SelectItem value="Fast Food Cooking">
                  Fast Food Cooking
                </SelectItem>
                <SelectItem value="Baking & Pastry">Baking & Pastry</SelectItem>
                <SelectItem value="Vegan Cooking">Vegan Cooking</SelectItem>
                <SelectItem value="Continental Cuisine">
                  Continental Cuisine
                </SelectItem>
                <SelectItem value="Indian Cuisine">Indian Cuisine</SelectItem>
                <SelectItem value="Nepali Cuisine">Nepali Cuisine</SelectItem>
                <SelectItem value="Chinese Cooking">Chinese Cooking</SelectItem>
                <SelectItem value="Professional Chef Skills">
                  Professional Chef Skills
                </SelectItem>
              </SelectGroup>

              {/* MEDICINE */}
              <SelectGroup>
                <SelectLabel>Medicine</SelectLabel>
                <SelectItem value="First Aid">First Aid</SelectItem>
                <SelectItem value="Pathology">Pathology</SelectItem>
                <SelectItem value="Nursing Skills">Nursing Skills</SelectItem>
                <SelectItem value="Pharmacy Basics">Pharmacy Basics</SelectItem>
                <SelectItem value="Clinical Research">
                  Clinical Research
                </SelectItem>
                <SelectItem value="Medical Coding">Medical Coding</SelectItem>
                <SelectItem value="Anatomy & Physiology">
                  Anatomy & Physiology
                </SelectItem>
                <SelectItem value="Mental Health">Mental Health</SelectItem>
              </SelectGroup>

              {/* OTHERS */}
              <SelectGroup>
                <SelectLabel>Others</SelectLabel>
                <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                <SelectItem value="Communication">Communication</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Personal Finance">
                  Personal Finance
                </SelectItem>
                <SelectItem value="Public Speaking">Public Speaking</SelectItem>
                <SelectItem value="Entrepreneurship">
                  Entrepreneurship
                </SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
                <SelectItem value="Language Learning">
                  Language Learning
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/course")}>
            Back
          </Button>
          <Button disabled={isLoading} onClick={createCourseHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
