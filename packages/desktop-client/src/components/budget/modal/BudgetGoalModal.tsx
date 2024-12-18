import React, { useEffect, useState, useRef } from 'react';
import { send } from 'loot-core/src/platform/client/fetch';
import { useDispatch } from 'react-redux';
import { applyBudgetAction } from 'loot-core/src/client/actions';
import { Modal } from '../../common/Modal';

type BudgetGoalModalProps = {
  setIsShowGoalModal: (value: boolean) => void;
  category: any;
};

export default function BudgetGoalModal({
  setIsShowGoalModal,
  category,
}: BudgetGoalModalProps) {
  const [state, setState] = useState({
    activeTab: 'goals',
    goalAmount: 0,
    budget: 0,
    upto: false,
    uptoAmount: 0,
    fromDate: '',
    toDate: '',
    goalRepeat: false,
    repeatDuration: 'week',
    every: 1,
  });

  useEffect(() => {
    let goalDef = JSON.parse(category.goal_def);
    if (goalDef && goalDef.length > 0) {
      goalDef = goalDef[0];
      if(goalDef.type == 'error'){
        let templateObj = extractTemplateStates(`${goalDef.line}`);
        setState(prevState => ({
          ...prevState,
          goalAmount: templateObj.goalAmount || 0,
          repeatDuration: templateObj.repeatDuration || '',
          toDate: templateObj.toDate || "",
          goalRepeat: templateObj.repeatDuration ? true : false
        }));
      }else if (goalDef.type == 'simple'){
        setState(prevState => ({
          ...prevState,
          budget: goalDef.monthly || 0
        }));        
      }else {
        setState(prevState => ({
          ...prevState,
          goalAmount: goalDef.amount || 0,
          toDate: goalDef.month || '',
          goalRepeat: goalDef.repeat || false,
        }));
      }
    }
  }, [category]);

  const dispatch = useDispatch();

  const handleInputChange = (field: string, value: any) => {
    setState(prevState => ({ ...prevState, [field]: value }));
  };

  const onBudgetAction = (month, type, args) => {
    dispatch(applyBudgetAction(month, type, args));
  };

  const applyGoalTemp = () => {
    const id = category.id;
    const template = createTemplate();
    send('notes-save', { id, note: template });
    onBudgetAction('2024-12', 'apply-single-category-template', {
      category: id,
    });
    setIsShowGoalModal(false);
  };

  const createTemplate = () => {
    let template = `#template`;

    if (state.activeTab === 'goals') {
      template += ` ${state.goalAmount}`;
      if (state.toDate) template += ` by ${state.toDate}`;
      if (state.goalRepeat)
        template += ` repeat every ${state.every > 1 ? `${state.every} ` : ''}${state.every > 1 ? `${state.repeatDuration}s` : `${state.repeatDuration}`}`;
    } else if (state.activeTab === 'planning') {
      if (state.budget) template += ` ${state.budget}`;
      if (state.uptoAmount) template += ` up to ${state.uptoAmount}`;
      if (state.repeatDuration) template += ` per ${state.repeatDuration}`;
      if (state.fromDate) template += ` starting ${state.fromDate}`;
    }
    return template;
  };

  function extractTemplateStates(input) {
    const templateRegex = {
      budgetAndUpTo: /#template\s+(\d+)?\s*up to\s*(\d+)/i,
      directBudget: /#template\s+(\d+)/,
      dateTo: /by\s+(\d{4}-\d{2})/,
      repeatDuration: /repeat every\s+([\w\s\d]+)/,
      startDate: /starting\s+(\d{4}-\d{2}-\d{2})/,
      frequency: /per\s+(\w+)/,
    };
  
    const states :any = {};
  
    // Extract budget
    const budgetMatch = input.match(templateRegex.budgetAndUpTo);
    if(budgetMatch) {
      if (budgetMatch[1]) {
        states.budget = budgetMatch[1];
      }
  
      if(budgetMatch[2]){
        states.uptoAmount = budgetMatch[2];
      }
    }

    // Extract budget
    const directBudgetMatch = input.match(templateRegex.directBudget);
    if(directBudgetMatch) {
      states.goalAmount = directBudgetMatch[1];
    }
  
    // Extract dateTo
    const dateToMatch = input.match(templateRegex.dateTo);
    if (dateToMatch) {
      states.toDate = dateToMatch[1];
    }
  
    // Extract repeatDuration
    const repeatMatch = input.match(templateRegex.repeatDuration);
    if (repeatMatch) {
      states.repeatDuration = repeatMatch[1].trim();
    }
  
    // Extract startDate
    const startDateMatch = input.match(templateRegex.startDate);
    if (startDateMatch) {
      states.fromDate = startDateMatch[1];
    }
  
    // Extract frequency
    const frequencyMatch = input.match(templateRegex.frequency);
    if (frequencyMatch) {
      states.repeatDuration = frequencyMatch[1];
    }
  
    return states;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" >
      <div className="inline-flex justify-center items-center">
        <div
          className="bg-white w-100 p-10"
          style={{ height: '60vh', width: '15vw' }}
        >
          <h2 className="text-2xl font-bold mb-4 text-black">
            {category.name}
          </h2>
          <div className="flex mb-2 border-b w-40">
            <button
              onClick={() => handleInputChange('activeTab', 'planning')}
              className={`flex-1 px-3 py-1 text-sm ${
                state.activeTab === 'planning'
                  ? 'border-b-2 border-gray-400 bg-gray-100 text-gray-800'
                  : 'text-gray-500'
              } focus:outline-none`}
            >
              Planning
            </button>
            <button
              onClick={() => handleInputChange('activeTab', 'goals')}
              className={`flex-1 px-3 py-1 text-sm ${
                state.activeTab === 'goals'
                  ? 'border-b-2 border-gray-400 bg-gray-100 text-gray-800'
                  : 'text-gray-500'
              } focus:outline-none`}
            >
              Goals
            </button>
          </div>
          <div style={{ height: '75%' }}>
            {state.activeTab === 'planning' ? (
              <div>
                <p className="text-sm text-gray-600 mb-5">
                  Automatically set budgets on this category
                </p>
                <form>
                  <div className="mb-2">
                    <label className="block text-black text-sm font-medium text-gray-800 mb-1">
                      Budget
                    </label>
                    <input
                      type="text"
                      className="w-56 text-black p-2 mt-2 border border-gray-300 rounded-lg outline-0"
                      placeholder="0,00"
                      value={state.budget}
                      onChange={e =>
                        handleInputChange('budget', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex justify-between w-56">
                    <div className="mb-7">
                      <input
                        type="checkbox"
                        className="mr-2 accent-black"
                        checked={state.upto}
                        onChange={() =>
                          handleInputChange('upto', !state.upto)
                        }
                      />
                      <label className="text-sm text-gray-900">Up to</label>
                    </div>
                    {state.upto && (
                      <div>
                        <input
                          type="text"
                          className="w-24 p-2 text-black border border-gray-300 rounded-lg outline-0"
                          placeholder="0,00"
                          value={state.uptoAmount}
                          onChange={e =>
                            handleInputChange('uptoAmount', e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-800">
                      Each
                    </label>
                    <div className="relative w-56">
                      <select
                        className="w-full text-black p-2 ps-3 border border-gray-300 rounded-lg bg-transparent outline-0"
                        onChange={e =>
                          handleInputChange('repeatDuration', e.target.value)
                        }
                      >
                        {['week', 'day'].map((v, k) => (
                          <option key={k} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Starting
                    </label>
                    <input
                      type="date"
                      className="w-56 text-black p-2 border border-gray-300 rounded-lg outline-0"
                      value={state.fromDate}
                      onChange={e =>
                        handleInputChange('fromDate', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="repeat"
                      className={`mr-2 accent-black`}
                      checked
                      disabled={state.upto ? true : false}
                    />
                    <label className="mr-4 text-gray-800">Repeat</label>
                    <input
                      type="radio"
                      name="repeat"
                      className="mr-2 accent-black"
                      disabled={state.upto ? true : false}
                    />
                    <label className="text-gray-800">Fill up</label>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-5">
                  Set goals on this category
                </p>
                <form>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      I want to have
                    </label>
                    <input
                      type="text"
                      className="w-56 text-black p-2 border border-gray-300 rounded-lg outline-0"
                      value={state.goalAmount}
                      onChange={e =>
                        handleInputChange('goalAmount', e.target.value)
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      At this date (optional)
                    </label>
                    <input
                      type="month"
                      className="w-56 text-black p-2 border border-gray-300 rounded-lg outline-0"
                      value={state.toDate}
                      onChange={e =>
                        handleInputChange('toDate', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      className="mr-2 accent-black"
                      checked={state.goalRepeat}
                      onChange={e =>
                        handleInputChange('goalRepeat', !state.goalRepeat)
                      }
                    />
                    <label className="text-sm text-gray-900">Repeat</label>
                  </div>
                  {state.goalRepeat && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Every
                      </label>
                      <div className="flex justify-between w-56">
                        <div className="relative w-20 mr-2">
                          <select
                            className="w-full text-black p-2 ps-3 border border-gray-300 rounded-lg bg-transparent outline-0"
                            onChange={e =>
                              handleInputChange('every', e.target.value)
                            }
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                              (v, k) => (
                                <option key={k} value={v}>
                                  {v}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                        <div className="relative w-56">
                          <select
                            className="w-full text-black p-2 ps-3 border border-gray-300 rounded-lg bg-transparent outline-0"
                            onChange={e =>
                              handleInputChange(
                                'repeatDuration',
                                e.target.value,
                              )
                            }
                          >
                            {['week', 'month', 'year'].map((v, k) => (
                              <option key={k} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
          <div className="flex mt-6">
            <button
              className="bg-gray-200 text-gray-800 px-3 py-1 mr-3 rounded-lg border border-black hover:bg-gray-300"
              onClick={() => setIsShowGoalModal(false)}
            >
              Cancel
            </button>
            <button
              className="bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-black"
              onClick={applyGoalTemp}
            >
              Add & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
