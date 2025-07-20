// File: D:/NexVidya/client/src/components/student/InstructorRequest.jsx

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const InstructorRequest = () => {
  const [accepted, setAccepted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    experience: "",
    subjectExpertise: "",
    demoLink: "",
    documents: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      for (const key in formData) {
        form.append(key, formData[key]);
      }

      const res = await fetch(
        "http://localhost:8080/api/v1/user/request-instructor",
        {
          method: "POST",
          credentials: "include",
          body: form,
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
      } else {
        alert(data.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong.");
    }
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4">Request to be an Instructor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Become an Instructor</DialogTitle>
          <DialogDescription>
            Accept our terms and conditions to continue your application.
          </DialogDescription>
        </DialogHeader>

        {!accepted ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              By clicking accept, you agree to our platform's instructor terms
              and conditions. Please ensure your content is original and
              educational.
            </p>
            <DialogFooter>
              <Button onClick={() => setAccepted(true)}>
                Accept & Continue
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="experience">Teaching Experience (in years)</Label>
              <Input
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="subjectExpertise">Subject Expertise</Label>
              <Input
                id="subjectExpertise"
                name="subjectExpertise"
                value={formData.subjectExpertise}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="demoLink">YouTube Demo Video Link</Label>
              <Input
                id="demoLink"
                name="demoLink"
                type="url"
                value={formData.demoLink}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="documents">Upload Related Documents</Label>
              <Input
                id="documents"
                name="documents"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Submit Application</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InstructorRequest;
