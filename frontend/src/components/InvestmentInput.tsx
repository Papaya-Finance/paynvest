import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { gsap } from 'gsap';

/**
 * InvestmentInput — анимированный числовой инпут с FLIP и scale анимациями.
 *
 * Ключевые особенности:
 * - Центрирование числа/placeholder через translateX(centerOffset), вычисляемый по ширине текста и контейнера.
 * - FLIP-анимация для перемещающихся цифр (цифры плавно едут при изменении позиции).
 * - Scale-анимация для появления/исчезновения цифр и запятых (ввод/удаление).
 * - Для запятой при смене позиции: scale-out ghost на старом месте, scale-in на новом.
 * - Все параметры шрифта (fontSize, fontWeight, fontFamily, monoFont) должны быть одинаковыми для input, renderCharacters и measureTextWidth.
 * - Ограничения на длину числа и дробной части настраиваются через props.
 * - Все стили можно переопределить через className, classNameNumber, classNameContainer.
 *
 * ВАЖНО: Каретка всегда находится в конце строки для упрощения анимаций.
 * Код для движения каретки закомментирован и будет доработан позже.
 *
 * Пример использования:
 * <InvestmentInput
 *   value={amount}
 *   onChange={setAmount}
 *   fontSize={48}
 *   fontWeight={700}
 *   fontFamily="monospace"
 *   monoFont
 *   maxDecimals={4}
 *   classNameNumber="text-primary"
 * />
 */
interface InvestmentInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  currency?: string;
  maxLength?: number;
  maxDecimals?: number;
  maxIntLength?: number;
  formatOnType?: boolean;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  className?: string;
  classNameNumber?: string;
  classNameContainer?: string;
}

const DEFAULT_FONT_SIZE = 36;
const DEFAULT_FONT_WEIGHT = 700;
const DEFAULT_FONT_FAMILY = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const DEFAULT_MAX_DECIMALS = 6;
const DEFAULT_MAX_INT = 999_999_999;
const DEFAULT_MAX_INT_LENGTH = 9;

function formatNumber(value: string): string {
  if (!value) return '';
  const cleaned = value.replace(/[^\d.]/g, '');
  const [integer, decimal] = cleaned.split('.');
  if (!integer) return '';
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted;
}

function parseFormattedNumber(formatted: string): string {
  return formatted.replace(/,/g, '');
}

function isValidInput(raw: string, maxIntLength: number, maxInt: number, maxDecimals: number): boolean {
  if (!raw) return true;
  const [intPart, decPart] = raw.split('.');
  if (intPart.length > maxIntLength) return false;
  if (Number(intPart) > maxInt) return false;
  if (decPart && decPart.length > maxDecimals) return false;
  const regex = new RegExp(`^\\d{0,${maxIntLength}}(\\.\\d{0,${maxDecimals}})?$`);
  return regex.test(raw);
}

export default function InvestmentInput({
  value,
  onChange,
  placeholder = '0',
  currency = '',
  maxLength = 15,
  maxDecimals = DEFAULT_MAX_DECIMALS,
  maxIntLength = DEFAULT_MAX_INT_LENGTH,
  formatOnType = true,
  fontSize = DEFAULT_FONT_SIZE,
  fontWeight = DEFAULT_FONT_WEIGHT,
  fontFamily = DEFAULT_FONT_FAMILY,
  className = '',
  classNameNumber = '',
  classNameContainer = '',
}: InvestmentInputProps) {
  const [centerOffset, setCenterOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevDisplay, setPrevDisplay] = useState<string>('');

  // ЗАКОММЕНТИРОВАНО: Код для движения каретки и выделения
  // const [selectionStart, setSelectionStart] = useState(0);
  // const [selectionEnd, setSelectionEnd] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const characterRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const prevRects = useRef<Record<string, DOMRect>>({});

  // Форматированное значение для отображения
  const display = formatOnType ? formatNumber(value) : value;

  // Построить массив для отображения с правильными ключами
  function getDisplayArr(raw: string) {
    const formatted = formatNumber(raw);
    const arr = [];
    let rawIdx = 0;
    let groupIdx = 0;
    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      if (char === ',') {
        arr.push({ char, key: `comma-${groupIdx++}` });
      } else {
        arr.push({ char, key: `digit-${rawIdx++}` });
      }
    }
    return arr;
  }
  const displayArr = getDisplayArr(value);

  // Сохраняем позиции символов перед изменением value
  const saveRects = useCallback((raw: string) => {
    const arr = getDisplayArr(raw);
    const rects: Record<string, DOMRect> = {};
    arr.forEach(({ key }) => {
      const el = characterRefs.current.get(key);
      if (el) rects[key] = el.getBoundingClientRect();
    });
    prevRects.current = rects;
  }, []);

  // Обработчик ввода с поддержкой дробей и ведущих нулей
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d.]/g, '');
    // Если пользователь первым вводит точку — подставляем 0.
    if (raw === '.') {
      raw = '0.';
    }
    // Если пользователь вводит .5, .12 и т.д. — подставляем 0.5, 0.12
    if (raw.startsWith('.') && raw.length > 1) {
      raw = '0' + raw;
    }
    // Не даём ввести несколько ведущих нулей, кроме случая "0." или "0.XXX"
    if (raw.startsWith('0') && raw.length > 1 && !raw.startsWith('0.')) {
      raw = raw.replace(/^0+/, '');
      if (raw === '' && e.target.value.startsWith('0')) {
        raw = '0';
      }
    }
    if (!isValidInput(raw, maxIntLength, DEFAULT_MAX_INT, maxDecimals)) return;
    if (raw !== value) {
      saveRects(value);
      setPrevDisplay(display);
      onChange(raw);
    }
  }, [onChange, value, display, saveRects, maxIntLength, maxDecimals]);

  // Центрирование по displayArr или placeholder
  // Важно: measureTextWidth использует те же параметры шрифта, что и input и renderCharacters
  const measureTextWidth = useCallback((text: string): number => {
    if (!inputRef.current) return 0;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    return context.measureText(text).width;
  }, [fontWeight, fontSize, fontFamily]);

  const calculateCenterOffset = useCallback((textWidth: number) => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return (containerWidth - textWidth) / 2;
  }, []);

  // Важно: для корректного центрирования используйте одинаковые параметры шрифта для input, renderCharacters и measureTextWidth
  useEffect(() => {
    if (containerRef.current) {
      // Если есть число — центрируем его, если нет — центрируем placeholder
      const text = displayArr.length ? displayArr.map(d => d.char).join('') : placeholder;
      const textWidth = measureTextWidth(text);
      const newCenterOffset = calculateCenterOffset(textWidth);
      setCenterOffset(newCenterOffset);
    }
  }, [displayArr, placeholder, measureTextWidth, calculateCenterOffset]);

  // FLIP-анимация для символов
  // movedKeys: FLIP для цифр, спецэффект для запятых (scale-out ghost + scale-in)
  // newKeys: scale-in для новых символов (отдельно для цифр и запятых)
  // removedKeys: scale-out для удалённых символов (отдельно для цифр и запятых)
  useLayoutEffect(() => {
    if (!prevDisplay || prevDisplay === display) {
      setPrevDisplay(display);
      return;
    }
    setIsAnimating(true);
    const prevArr = getDisplayArr(parseFormattedNumber(prevDisplay));
    const currArr = displayArr;
    const prevKeys = prevArr.map(item => item.key);
    const currKeys = currArr.map(item => item.key);
    const newKeys = currKeys.filter(key => !prevKeys.includes(key));
    const removedKeys = prevKeys.filter(key => !currKeys.includes(key));
    const movedKeys = currKeys.filter(key => prevKeys.includes(key));
    // FLIP для цифр, спецэффект для запятых
    movedKeys.forEach((key) => {
      if (key.startsWith('digit-')) {
        // FLIP для цифр: плавное перемещение по x
        const el = characterRefs.current.get(key);
        if (prevRects.current[key] && el) {
          const prevRect = prevRects.current[key];
          const newRect = el.getBoundingClientRect();
          const dx = prevRect.left - newRect.left;
          if (dx !== 0) {
            gsap.fromTo(el, { x: dx }, { x: 0, duration: 0.35, ease: 'power2.out' });
          }
        }
      } else if (key.startsWith('comma-')) {
        // Для запятой: scale-out ghost на старом месте, scale-in на новом
        const el = characterRefs.current.get(key);
        const prevRect = prevRects.current[key];
        if (prevRect && el) {
          const newRect = el.getBoundingClientRect();
          if (prevRect.left !== newRect.left) {
            // scale-out ghost на старом месте
            const ghost = document.createElement('span');
            ghost.textContent = ',';
            ghost.style.position = 'fixed';
            ghost.style.left = prevRect.left + 'px';
            ghost.style.top = prevRect.top + 'px';
            ghost.style.fontSize = `${fontSize}px`;
            ghost.style.fontWeight = fontWeight.toString();
            ghost.style.fontFamily = fontFamily;
            ghost.style.pointerEvents = 'none';
            ghost.style.zIndex = '9999';
            document.body.appendChild(ghost);
            gsap.fromTo(ghost, { scale: 1, opacity: 1 }, {
              scale: .8, opacity: 0, duration: .2, ease: 'power2.out', onComplete: () => {
                document.body.removeChild(ghost);
              }
            });
            // scale-in на новом месте
            gsap.fromTo(el, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.out' });
          }
        }
      }
    });
    // Scale-in для новых символов
    newKeys.forEach((key) => {
      const el = characterRefs.current.get(key);
      if (el) {
        if (key.startsWith('comma-')) {
          // Особая анимация для запятой
          gsap.fromTo(el, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.out' });
        } else {
          // Обычная анимация для цифр
          gsap.fromTo(el, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.26, ease: 'power2.out' });
        }
      }
    });
    // Scale-out для удалённых символов
    removedKeys.forEach((key) => {
      const prevRect = prevRects.current[key];
      if (prevRect) {
        const ghost = document.createElement('span');
        ghost.textContent = key.startsWith('comma') ? ',' : prevArr.find(item => item.key === key)?.char || '';
        ghost.style.position = 'fixed';
        ghost.style.left = prevRect.left + 'px';
        ghost.style.top = prevRect.top + 'px';
        ghost.style.fontSize = `${fontSize}px`;
        ghost.style.fontWeight = fontWeight.toString();
        ghost.style.fontFamily = fontFamily;
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = '9999';
        document.body.appendChild(ghost);
        if (key.startsWith('comma-')) {
          // Особая анимация для запятой
          gsap.fromTo(ghost, { scale: 1, opacity: 1 }, {
            scale: .8, opacity: 0, duration: .2, ease: 'power2.out', onComplete: () => {
              document.body.removeChild(ghost);
            }
          });
        } else {
          // Обычная анимация для цифр
          gsap.fromTo(ghost, { scale: 1, opacity: 1 }, {
            scale: 0.4, opacity: 0, duration: 0.2, ease: 'power2.out', onComplete: () => {
              document.body.removeChild(ghost);
            }
          });
        }
      }
    });
    setPrevDisplay(display);
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [display, prevDisplay, displayArr, fontSize, fontWeight, fontFamily]);

  // ЗАКОММЕНТИРОВАНО: Синхронизация selection с input
  // const updateSelection = useCallback(() => {
  //   if (inputRef.current) {
  //     setSelectionStart(inputRef.current.selectionStart ?? 0);
  //     setSelectionEnd(inputRef.current.selectionEnd ?? 0);
  //     // Временный вывод для отладки
  //     console.log('selectionStart:', inputRef.current.selectionStart, 'selectionEnd:', inputRef.current.selectionEnd);
  //   }
  // }, []);

  // useEffect(() => {
  //   updateSelection();
  // }, [value, isFocused]);

  // ЗАКОММЕНТИРОВАНО: Функция для маппинга raw индекса (input) в индекс displayArr (с учётом запятых)
  // function getDisplayIndexWithCommas(rawIdx: number, displayArr: { key: string; char: string }[]) {
  //   let count = 0;
  //   let visualIdx = 0;
  //   for (let i = 0; i < displayArr.length; i++) {
  //     if (displayArr[i].key.startsWith('digit-')) {
  //       if (count === rawIdx) return visualIdx;
  //       count++;
  //     }
  //     visualIdx++;
  //   }
  //   // Если rawIdx больше количества цифр, вернуть конец строки
  //   return displayArr.length;
  // }

  // ЗАКОММЕНТИРОВАНО: Маппинг выделения и caret по displayArr (визуально, с учётом запятых)
  // let selectionRect = { left: 0, width: 0 };
  // let caretOffset = 0;
  // if (displayArr.length) {
  //   const displaySelStart = getDisplayIndexWithCommas(selectionStart, displayArr);
  //   const displaySelEnd = getDisplayIndexWithCommas(selectionEnd, displayArr);
  //   let left = 0, width = 0;
  //   for (let i = 0; i < displayArr.length; i++) {
  //     const el = characterRefs.current.get(displayArr[i].key);
  //     if (!el) continue;
  //     if (i < displaySelStart) left += el.offsetWidth;
  //     if (i >= displaySelStart && i < displaySelEnd) width += el.offsetWidth;
  //     if (i < displaySelEnd) caretOffset += el.offsetWidth;
  //     console.log("Caret offset:", caretOffset);
  //   }
  //   if (isFocused && selectionStart !== selectionEnd) {
  //     selectionRect = { left, width };
  //   }
  // }

  // ЗАКОММЕНТИРОВАНО: Обработчик копирования: копируем только цифры и точку из выделенного диапазона
  // const handleCopy = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
  //   if (!isFocused || selectionStart === selectionEnd) return;
  //   const selStart = Math.min(selectionStart, selectionEnd);
  //   const selEnd = Math.max(selectionStart, selectionEnd);
  //   const selected = displayArr.slice(selStart, selEnd)
  //     .map(d => d.char)
  //     .filter(char => /[0-9.]/.test(char))
  //     .join('');
  //   e.clipboardData.setData('text/plain', selected);
  //   e.preventDefault();
  // }, [isFocused, selectionStart, selectionEnd, displayArr]);

  // Вычисляем позицию каретки в конце строки
  let caretOffset = 0;
  if (displayArr.length) {
    for (let i = 0; i < displayArr.length; i++) {
      const el = characterRefs.current.get(displayArr[i].key);
      if (el) {
        caretOffset += el.offsetWidth;
      }
    }
  } else {
    // Если поле пустое — caretOffset = ширина placeholder
    caretOffset = measureTextWidth(placeholder);
  }

  // Create character elements with caret and selection
  const renderCharacters = () => {
    if (!displayArr.length) {
      // Плейсхолдер без курсора/выделения
      return (
        <span
          className={`text-stone-400 dark:text-stone-500 opacity-50 ${classNameNumber}`}
          style={{ fontSize, fontWeight, fontFamily }}
        >
          {placeholder}
        </span>
      );
    }
    // Маппинг индексов: raw value -> displayArr (цифры и запятые)
    return displayArr.map(({ char, key }, index) => {
      const isDigit = key.startsWith('digit-');
      return (
        <span
          key={key}
          ref={el => {
            if (el) {
              characterRefs.current.set(key, el);
            } else {
              characterRefs.current.delete(key);
            }
          }}
          className={`character-element inline-block ${classNameNumber}`}
          style={{
            fontSize,
            fontWeight,
            fontFamily,
            transformOrigin: 'center center',
            willChange: isAnimating ? 'transform, opacity' : 'auto',
            position: 'relative',
            verticalAlign: 'middle',
          }}
          data-character={char}
          data-index={index}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 rounded-xl py-6 px-2 mb-2 transition-all duration-200 ${className}`}
      style={{ minHeight: 64 }}
    >
      <label className="sr-only">Investment Amount</label>
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden ${classNameContainer}`}
        style={{ height: 48, transition: 'width .25s' }}
      >
        {/* Hidden input for actual value */}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          pattern="[0-9,.]*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={e => { 
            setIsFocused(true); 
            // ЗАКОММЕНТИРОВАНО: updateSelection(); 
          }}
          onBlur={() => setIsFocused(false)}
          // ЗАКОММЕНТИРОВАНО: onSelect={updateSelection}
          // ЗАКОММЕНТИРОВАНО: onInput={updateSelection}
          // ЗАКОММЕНТИРОВАНО: onCopy={handleCopy}
          autoComplete="off"
          maxLength={maxLength}
          style={{
            fontSize,
            fontWeight,
            fontFamily,
            textAlign: 'center',
          }}
        />
        {/* Display layer with animated characters */}
        <div
          className="absolute left-0 top-0 w-full h-full select-none pointer-events-none"
          style={{
            display: 'block',
            transform: `translateX(${centerOffset}px)`,
            transition: 'transform .25s',
            textAlign: centerOffset === 0 ? 'center' : undefined,
          }}
        >
          {currency && (
            <span
              className="mr-1"
              style={{ fontSize, fontWeight, fontFamily }}
            >
              {currency}
            </span>
          )}
          {renderCharacters()}
          {/* Абсолютно позиционированный caret - всегда в конце строки */}
          {isFocused && (
            <span
              className="caret"
              style={{
                position: 'absolute',
                left: caretOffset,
                top: 0,
                height: '100%',
                width: 1,
                background: 'currentColor',
                animation: 'blink-caret 1s steps(1) infinite',
                pointerEvents: 'none',
              }}
            />
          )}
          {/* ЗАКОММЕНТИРОВАНО: Абсолютно позиционированный selection */}
          {/* {isFocused && selectionStart !== selectionEnd && selectionRect.width > 0 && (
            <span
              style={{
                position: 'absolute',
                left: selectionRect.left,
                width: selectionRect.width,
                top: 0,
                height: '100%',
                background: '#cce3ff',
                borderRadius: 2,
                zIndex: -10,
                pointerEvents: 'none',
                opacity: 1,
              }}
            />
          )} */}
        </div>
      </div>
    </div>
  );
}

// Добавляем keyframes для мигания курсора
if (typeof window !== 'undefined' && !document.getElementById('investment-input-caret-style')) {
  const style = document.createElement('style');
  style.id = 'investment-input-caret-style';
  style.innerHTML = `@keyframes blink-caret { 0%,100%{opacity:1} 50%{opacity:0} }`;
  document.head.appendChild(style);
} 