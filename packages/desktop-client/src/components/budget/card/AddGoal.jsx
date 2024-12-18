import { useState } from 'react';
import money from "../../../icons/v2/money.svg"
import bullseye from "../../../icons/v2/bullseye.svg"

function AddGoalCard({onCancel, updateTitleGoal}) {

  const [title, setTitle] = useState('Trip to Norway');
  const [upToDuration, SetUpToDuration] = useState('3 Months');
  const [editTitle, setEditTitle] = useState(false);
  const [budget, setBudget] = useState(3000);
  const [editingBudget, setEditingBudget] = useState(false);

  const toggleOptions = ["3 Months", "6 Months", "1 Year" ]

  function updateTitle(){
    updateTitleGoal(title)
    setEditTitle(false)
  }


  return (
    <div className="w-[23rem] mx-auto bg-white shadow-lg rounded-lg pb-2 text-black">
      <div className="flex justify-between items-center border-b-2 mb-4 p-4">
        <div>
          {editTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => updateTitle()}
              className="text-xl font-semibold focus:outline-none"
            />
          ) : (
            <h2
              onClick={() => setEditTitle(true)}
              className="text-xl font-semibold cursor-pointer border-0"
            >
              {title}
            </h2>
          )}
        </div>
        <button className="text-purple-500 font-semibold text-2xl" onClick={onCancel}>&times;</button>
      </div>

      <div className="mb-6 px-6 pb-0">
        <div className="flex border rounded-full overflow-hidden">
            {toggleOptions.map((option) => (
                <button
                key={option}
                onClick={() => SetUpToDuration(option)}
                className={`px-5 border-l text-[#3A3A3A] w-full mx-auto py-4 text-sm font-medium
                  ${upToDuration === option ? "bg-[#8719E01A] text-[#8719E0] border-[#8719E0] border" : ""}
                  ${option === "3 Months" ? "rounded-l-full" : ""}
                  ${option === "1 Year" ? "rounded-r-full" : ""}
                `}
              >
                {option}
              </button>              
            ))}
        </div>

        <div className="px-6 mt-3 flex items-center space-x-2 border-b-2 py-2">
          <div>
            <img src={money} alt="money-bills-simple-1"/>
          </div>
          <div className='pl-2'>
            <p>To Budget</p>
            {editingBudget ? (
                <span className='text-2xl font-bold focus:outline-none'>
                    $
                    <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        onBlur={() => setEditingBudget(false)}
                        className='w-48 border-0'
                        />
                </span>
            ) : (
                <p onClick={() => setEditingBudget(true)} className="text-2xl font-bold cursor-pointer">
                ${budget}
                </p>
            )}
          </div>
        </div>

        <div className="px-6 mt-3 flex items-center space-x-2 border-b-2 py-2">
          <div>
            <img src={bullseye} alt="bullseye-1"/>
          </div>
          <div className='pl-2'>
            <p className="text-gray-700 text-sm">I want to</p>
            <p className="text-lg">
                Refill up to <span className="font-bold">${budget}</span>
            </p>
          </div>
        </div>

        <div className='mt-5'>
            <button className="w-full py-3 bg-[#8719E0] text-white font-semibold rounded-lg">
                Save
            </button>
        </div>
      </div>
    </div>
  );
}

export default AddGoalCard;
