import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";

const categories = [
  {
    main: "Tech",
    subcategories: [
      "Web Development",
      "Frontend Development",
      "Backend Development",
      "Fullstack Development",
      "MERN Stack",
      "JavaScript",
      "Python",
      "Data Science",
      "Machine Learning",
      "AI & Deep Learning",
      "Cloud Computing",
      "Cybersecurity",
      "Ethical Hacking",
      "Blockchain",
      "Networking",
      "DevOps",
      "Mobile App Development",
      "UI/UX Design",
      "Game Development",
    ],
  },
  {
    main: "Agriculture",
    subcategories: [
      "Organic Farming",
      "Precision Agriculture",
      "Aquaculture",
      "Animal Husbandry",
      "Agroforestry",
      "Soil Science",
      "Agricultural Machinery",
    ],
  },
  {
    main: "Cooking",
    subcategories: [
      "Fast Food Cooking",
      "Baking & Pastry",
      "Vegan Cooking",
      "Continental Cuisine",
      "Indian Cuisine",
      "Nepali Cuisine",
      "Chinese Cooking",
      "Professional Chef Skills",
    ],
  },
  {
    main: "Medicine",
    subcategories: [
      "First Aid",
      "Pathology",
      "Nursing Skills",
      "Pharmacy Basics",
      "Clinical Research",
      "Medical Coding",
      "Anatomy & Physiology",
      "Mental Health",
    ],
  },
  {
    main: "Others",
    subcategories: [
      "Soft Skills",
      "Communication",
      "Leadership",
      "Personal Finance",
      "Public Speaking",
      "Entrepreneurship",
      "Photography",
      "Language Learning",
    ],
  },
];

const Filter = ({ handleFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");
  const [mainCategory, setMainCategory] = useState("");

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      handleFilterChange(updated, sortByPrice);
      return updated;
    });
  };

  const selectByPriceHandler = (selectedValue) => {
    setSortByPrice(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
  };

  const handleMainCategoryChange = (selectedMain) => {
    setMainCategory(selectedMain);
    setSelectedCategories([]); // reset subcategories
    handleFilterChange([], sortByPrice); // clear filters initially
  };

  const currentSubcategories =
    categories.find((cat) => cat.main === mainCategory)?.subcategories || [];

  return (
    <div className="w-full md:w-[20%]">
      <div className="flex flex-col gap-2 md:gap-4">
        <h1 className="font-semibold text-lg md:text-xl">Filter Options</h1>

        {/* Sort by Price */}
        <div>
          <Label>Sort by</Label>
          <Select onValueChange={selectByPriceHandler}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by price" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort by price</SelectLabel>
                <SelectItem value="low">Low to High</SelectItem>
                <SelectItem value="high">High to Low</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Select Main Category */}
        <div>
          <Label>Category</Label>
          <Select onValueChange={handleMainCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category group" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Main Category</SelectLabel>
                {categories.map((cat) => (
                  <SelectItem key={cat.main} value={cat.main}>
                    {cat.main}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Subcategory checkboxes */}
      {mainCategory && (
        <div>
          <h2 className="font-semibold mb-2">{mainCategory} Subcategories</h2>
          {currentSubcategories.map((subcategory) => (
            <div
              key={subcategory}
              className="flex items-center space-x-2 my-1 ml-2"
            >
              <Checkbox
                id={subcategory}
                checked={selectedCategories.includes(subcategory)}
                onCheckedChange={() => handleCategoryChange(subcategory)}
              />
              <Label
                htmlFor={subcategory}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {subcategory}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Filter;
