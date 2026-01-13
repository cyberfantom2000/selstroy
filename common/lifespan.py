from dataclasses import dataclass
from typing import Callable
from contextlib import asynccontextmanager

from common import settings, get_logger


log = get_logger(settings, 'Lifespan')


@dataclass
class Task:
    call: Callable
    args: tuple
    kwargs: dict


class Lifespan:
    """ Application life span. Execute task before fast api app starting and after shutting down """
    def __init__(self):
        self.counter = 0
        self.starting_tasks = {}
        self.stopping_tasks = {}

    def add_starting_task(self, callback: Callable, *args, **kwargs) -> int:
        """ Add task to execute before starting application
        :param callback: callback function
        :param args: callback positional args
        :param kwargs: callback keyword args
        """
        self.starting_tasks[self.counter + 1] = Task(call=callback, args=args, kwargs=kwargs)
        self.counter += 1
        log.info(f'added starting task id={self.counter}, task: {self.starting_tasks[self.counter]}')
        return self.counter

    def add_shutdown_task(self, callback: Callable, *args, **kwargs) -> int:
        """ Add task to execute after application shutting down
        :param callback: callback function
        :param args: callback positional args
        :param kwargs: callback keyword args
        """
        self.stopping_tasks[self.counter + 1] = Task(call=callback, args=args, kwargs=kwargs)
        self.counter += 1
        log.info(f'added shutdown task id={self.counter}, task: {self.stopping_tasks[self.counter]}')
        return self.counter

    def remove_starting_task(self, number: int) -> None:
        """ Remove starting task
        :param number: task unique number
        """
        task = self.starting_tasks.pop(number, False)
        log.info(f'removed starting task id={number}, task: {task}')

    def remove_shutdown_task(self, number: int) -> None:
        """ Remove stopping task
        :param number: task unique number
        """
        task = self.stopping_tasks.pop(number, False)
        log.info(f'removed shutdown task id={number}, task: {task}')

    @asynccontextmanager
    async def __call__(self, app):
        """ Application lifespan event handler.
        Handle all starting tasks, wait app shutting down, handle all stopping tasks.
        Tasks removed after completing
        :param app: application instance
        """
        log.info('starting')
        for task_id, task in self.starting_tasks.items():
            self._handle_task(task_id, task)

        log.info(f'completed {len(self.starting_tasks)} starting tasks')
        self.starting_tasks.clear()

        yield

        log.info('shutting down')
        for task_id, task in self.stopping_tasks.items():
            self._handle_task(task_id, task)

        log.info(f'completed {len(self.stopping_tasks)} stopping tasks')
        self.stopping_tasks.clear()

    @staticmethod
    def _handle_task(task_id: int, task: Task):
        try:
            log.info(f'task id={task_id} executing. Task: {task}')
            task.call(*task.args, **task.kwargs)
        except Exception as exc:
            log.error(f'task id={task_id} failed. Task: {task}')
            log.error(f'task id={task_id} error: {exc}')
            raise