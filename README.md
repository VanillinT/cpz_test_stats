# Cryptuoso Test Statistics

## Задача

Переработать функцию `calcStatistics` в файле `libs/trade-statistics/src/lib/trade-statistics.ts` для поддержки кумулятивного режима работы.

Вместо массива позиций передается по 1ой позиции за раз, а промежуточный результат накапливается.

После нескольких последовательных вызовов функции используя тестовые данные из файла `libs/trade-statistics/src/lib/testData/positionsForStats.ts` - выходные данные должны быть строго равны данным из файла `libs/trade-statistics/src/lib/testData/correctResult.ts` согласно тесту `libs/trade-statistics/src/lib/trade-statistics.spec.ts`.

## Требования

Весь код в файле `libs/trade-statistics/src/lib/trade-statistics.ts` может быть изменен без каких-либо ограничений.
Можно добавлять новые методы, файлы, промежуточные тесты - если это необходимо.

## Запуск теста

Выполнить `npm run test trade-statistics` для запуска теста с помощью Jest.
