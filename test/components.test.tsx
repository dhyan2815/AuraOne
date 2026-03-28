import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'chai';
import sinon from 'sinon';

// --- Mock Data and Types ---
// NOTE: These are simplified local types for testing purposes.
interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  tags?: string[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
}

const mockNote: Note = {
  id: "1",
  title: "Sample note",
  content: "<p>Note content</p>",
  created_at: new Date().toISOString(),
  tags: ["tag1"],
};

const mockTask: Task = {
  id: "t1",
  title: "Sample task",
  description: "Task description",
  due_date: new Date().toISOString(),
  priority: "low",
  completed: false,
};

// --- Component Imports ---
import Card from '../src/components/ui/Card';
import NoteCard from '../src/components/notes/NoteCard';
import TaskCard from '../src/components/tasks/TaskCard';
import NewsWidget from '../src/components/widgets/NewsWidget';
import WeatherWidget from '../src/components/widgets/WeatherWidget';
import TasksWidget from '../src/components/widgets/TasksWidget';
import CalendarWidget from '../src/components/widgets/CalendarWidget';

// --- Tests ---

describe("Card Component", () => {
  it("renders title and children", () => {
    render(
      <Card title="Test Title">
        <div>Test Children</div>
      </Card>
    );
    expect(screen.getByText("Test Title")).to.exist;
    expect(screen.getByText("Test Children")).to.exist;
  });

  it("renders an action link when actionHref is provided", () => {
    render(
      <MemoryRouter>
        <Card title="Link Card" actionLabel="Click me" actionHref="/test">
          <div>Child</div>
        </Card>
      </MemoryRouter>
    );
    const link = screen.getByText("Click me");
    expect(link).to.exist;
    expect(link.closest("a")).to.have.property("href", "http://localhost/test");
  });
});

describe("NoteCard Component", () => {
    it("renders correctly in list view", () => {
        render(
            <MemoryRouter>
                <NoteCard note={mockNote} viewMode="list" />
            </MemoryRouter>
        );
        expect(screen.getByText("Sample note")).to.exist;
        expect(screen.getByText("Note content")).to.exist;
        const dateEl = screen.getByText(/Mar \d{1,2}, \d{4}/);
        expect(dateEl).to.exist;
    });

    it("renders correctly in grid view and is a link", () => {
        render(
            <MemoryRouter>
                <NoteCard note={mockNote} viewMode="grid" />
            </MemoryRouter>
        );
        const link = screen.getByText('Sample note').closest('a');
        expect(link).to.exist;
        expect(link).to.have.property('href', `http://localhost/notes/${mockNote.id}`);
    });
});

describe("TaskCard Component", () => {
    it("renders in list view with priority badge and toggle", () => {
        const onToggle = sinon.spy();
        render(
            <MemoryRouter>
                <TaskCard task={mockTask} viewMode="list" onToggleComplete={onToggle} />
            </MemoryRouter>
        );
        expect(screen.getByText(mockTask.title)).to.exist;
        expect(screen.getByText("Low")).to.exist;
        const toggleBtn = screen.getByRole("button");
        fireEvent.click(toggleBtn);
        sinon.assert.calledOnce(onToggle);
    });

    it("renders in grid view and is a link", () => {
        render(
            <MemoryRouter>
                <TaskCard task={mockTask} viewMode="grid" onToggleComplete={() => {}} />
            </MemoryRouter>
        );
        const link = screen.getByText(mockTask.title).closest('a');
        expect(link).to.exist;
        expect(link).to.have.property('href', `http://localhost/tasks/${mockTask.id}`);
    });
});

describe("NewsWidget Component", () => {
    beforeEach(() => {
        global.fetch = sinon.stub().resolves({
            ok: true,
            json: () => Promise.resolve({
                results: [{
                    title: "Breaking News",
                    source_id: "SourceX",
                    link: "https://example.com",
                    pubDate: new Date().toISOString()
                }]
            })
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders loading state then news items", async () => {
        render(<NewsWidget />);
        expect(await screen.findByText("Scanning Feeds...")).to.exist;
        expect(await screen.findByText("Breaking News")).to.exist;
        const link = screen.getByRole("link", { name: /Breaking News/i });
        expect(link).to.have.attribute("href", "https://example.com");
    });
});

describe("WeatherWidget Component", () => {
    beforeEach(() => {
        global.fetch = sinon.stub().resolves({
            ok: true,
            json: () => Promise.resolve({
                current: { temp_c: 25, condition: { text: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" } },
                location: { name: "Test City" }
            })
        });

        Object.defineProperty(global.navigator, 'geolocation', {
            value: {
                getCurrentPosition: sinon.stub().callsFake((success) => success({ coords: { latitude: 0, longitude: 0 } }))
            },
            configurable: true
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders loading state then weather data", async () => {
        render(<WeatherWidget />);
        expect(await screen.findByText("Syncing Weather...")).to.exist;
        expect(await screen.findByText("Test City")).to.exist;
        expect(screen.getByText("25°C")).to.exist;
        expect(screen.getByText("Sunny")).to.exist;
    });
});

describe("TasksWidget Component", () => {
  it("renders empty state when no tasks", () => {
    render(<TasksWidget tasks={[]} />);
    expect(screen.getByText(/No tasks assigned/i)).to.exist;
  });

  it("renders list of tasks", () => {
    const mockTasks: Task[] = [
      { id: "t1", title: "Task One", completed: false },
      { id: "t2", title: "Task Two", completed: true }
    ];
    render(
        <MemoryRouter>
            <TasksWidget tasks={mockTasks} />
        </MemoryRouter>
    );
    expect(screen.getByText("Task One")).to.exist;
    expect(screen.getByText("Task Two")).to.exist;
  });
});

describe("CalendarWidget Component", () => {
  it("renders the month grid and allows date selection", () => {
    const onSelect = sinon.spy();
    render(
        <CalendarWidget onDateSelect={onSelect} selectedDate={new Date()} events={[]} />
    );
    const dayButton = screen.getAllByRole("button").find(b => b.textContent === "15");
    expect(dayButton).to.exist;
    fireEvent.click(dayButton!);
    sinon.assert.called(onSelect);
  });
});
