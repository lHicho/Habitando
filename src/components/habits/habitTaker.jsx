import "./habits.css";

import { MdOutlineCancel } from "react-icons/md";

import { useState, useEffect } from "react";
import { useUser } from "../../context/userContext";
import { toast } from "react-hot-toast";
import { useSidebar } from "../../context/sideContext";
import IconGenerator from "../iconGenerator";

import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

export default function HabitTaker({ edit }) {
  const { addHabit, editHabit } = useUser();
  const { habitTaker, closeHabitTaker, habit } = useSidebar();

  const [iconPicker, setIconPicker] = useState(false);
  const [sideInfo, setSideInfo] = useState(false);
  const [habitData, setHabitData] = useState({
    name: "",
    importance: "",
    description: "",
    icon: "",
    sideMissions: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHabitData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (edit) {
      setHabitData({ ...habit, sideMissions: habit.sideMissions || [] });
    } else {
      setHabitData({
        name: "",
        importance: "",
        description: "",
        icon: "",
        sideMissions: [],
      });
    }
  }, [habit, edit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const responce = await (edit ? editHabit(habitData) : addHabit(habitData));
    if (responce == 100) {
      toast.error("Habit allready existing.");
    } else if (responce == 200) {
      toast.success("Habit added succesfully.");
      setHabitData({
        name: "",
        importance: "",
        description: "",
        icon: "",
        sideMissions: [],
      });
    } else if (responce == 300) {
      toast.success("Habit edited succesfully.");
    }
  };

  const addSideMission = () => {
    setHabitData((prev) => ({
      ...prev,
      sideMissions: [
        ...(prev.sideMissions || []),
        { name: "", importance: "" },
      ],
    }));
  }

  const updateSideMission = (index, field, value) => {
    setHabitData((prev) => {
      const newMissions = [...(prev.sideMissions || [])];
      newMissions[index] = { ...newMissions[index], [field]: value };
      return { ...prev, sideMissions: newMissions };
    });
  };

  const deleteSideMission = (index) => {
    setHabitData((prev) => {
      const newMissions = [...(prev.sideMissions || [])];
      newMissions.splice(index, 1);
      return { ...prev, sideMissions: newMissions };
    });
  };

  const pickedIcon = (index) => {
    setHabitData((prev) => ({
      ...prev,
      icon: index,
    }));
    setIconPicker(false);
  };

  return (
    <div
      className={"coverDiv " + (habitTaker ? "coverDivOn" : "coverDivOff")}
      onClick={() => closeHabitTaker()}
    >
      <button className="coverDivButton" onClick={() => closeHabitTaker()}>
        <MdOutlineCancel />
      </button>
      <div className="infoForm" onClick={(e) => e.stopPropagation()}>
        {iconPicker ? (
          <div className="mainInfos">
            <h1>Choose an icon</h1>
            <div className="iconPickerContainer">
              {Array.from({ length: 26 }).map((_, index) => (
                <div
                  key={index}
                  className="iconPickerDiv"
                  onClick={() => pickedIcon(index)}
                >
                  <IconGenerator icon={index.toString()} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div
              className={
                "mainInfos " + (sideInfo ? "mainInfosOut" : "mainInfosIn")
              }
            >
              <div className="takerHead">
                <div className="spaceHolder"></div>
                <h1>Add Habit</h1>
                <button
                  onClick={() => {
                    setSideInfo(true)
                  }}
                  title="Add Side Messions"
                >
                  Messions <FaArrowRight />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="titleDiv">
                  <div
                    className="iconTaker"
                    onClick={() => setIconPicker(!iconPicker)}
                  >
                    <IconGenerator
                      icon={habitData.icon ? habitData.icon : "star"}
                    />
                  </div>
                  <input
                    onChange={handleChange}
                    type="text"
                    placeholder="Habit name"
                    className="titleInput"
                    name="name"
                    value={habitData.name}
                  />
                  <input
                    onChange={handleChange}
                    type="number"
                    placeholder="3"
                    className="numberInput"
                    name="importance"
                    value={habitData.importance}
                  />
                </div>
                <textarea
                  placeholder="Habit description"
                  onChange={handleChange}
                  name="description"
                  value={habitData.description}
                />
                <button type="submit">
                  {edit ? "Edit Habit" : "Add Habit"}
                </button>
              </form>
            </div>

            <div className={"sideInfosDiv " + (sideInfo ? "sideInfosDivIn" : "sideInfosDivOut")}>
              <div className="takerHead">
                <button
                  onClick={() => {
                    setSideInfo(false);
                  }}
                  title="Go Back"
                >
                  <FaArrowLeft />
                </button>
                <h1>Edit Side Messions</h1>
                <div className="spaceHolder"></div>
              </div>
              <div className="content">
                <div className="sideMissionsList">
                  {habitData.sideMissions &&
                    habitData.sideMissions.map((mission, index) => (
                      <div key={index} className="sideMissionRow">
                        <input
                          type="text"
                          placeholder="Side mission name"
                          value={mission.name}
                          onChange={(e) =>
                            updateSideMission(index, "name", e.target.value)
                          }
                          className="nameInput"
                        />
                        <input
                          type="number"
                          placeholder="Imp"
                          value={mission.importance}
                          onChange={(e) =>
                            updateSideMission(index, "importance", e.target.value)
                          }
                          className="importanceInput"
                        />
                        <button
                          className="deleteSideMissionBtn"
                          onClick={() => deleteSideMission(index)}
                          title="Delete Mission"
                        >
                          <MdOutlineCancel />
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  className="addSideMissionBtn"
                  onClick={() => addSideMission()}
                >
                  Add Side Mission
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
