"use client";

import { useTranslations } from "next-intl";
import type { CategoryParentOption, CategoryType } from "@repo/shared";
import { Badge } from "@repo/ui";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxLoading,
  ComboboxTrigger,
} from "@/src/components/common";
import { useCategoryParentOptions } from "../hooks/use-categories";

type CategoryParentPickerProps = {
  currentCategoryId?: string;
  disabled?: boolean;
  onChange: (parentId: string) => void;
  type: CategoryType;
  value: string;
};

const NO_PARENT_VALUE = "__no_parent__";

export function CategoryParentPicker({
  currentCategoryId,
  disabled,
  onChange,
  type,
  value,
}: CategoryParentPickerProps) {
  const t = useTranslations("Categories");
  const categoriesQuery = useCategoryParentOptions(
    {
      currentCategoryId,
      type,
    },
    {
      enabled: !disabled,
    },
  );
  const options = categoriesQuery.data ?? [];
  const selected = options.find((category) => category.id === value);
  const comboboxValue = value || NO_PARENT_VALUE;

  return (
    <div className="space-y-2">
      <Combobox
        disabled={disabled || categoriesQuery.isLoading}
        onValueChange={(nextValue) =>
          onChange(nextValue === NO_PARENT_VALUE ? "" : nextValue)
        }
        value={comboboxValue}
      >
        <ComboboxTrigger
          id="category-parent"
          placeholder={t("noParent")}
          selectedLabel={selected ? formatParentPath(selected) : t("noParent")}
        />
        <ComboboxContent>
          <ComboboxInput placeholder={t("parentSearchPlaceholder")} />
          <ComboboxList>
            <ComboboxItem value={NO_PARENT_VALUE}>{t("noParent")}</ComboboxItem>
            {categoriesQuery.isLoading ? (
              <ComboboxLoading label={t("parentLoading")} />
            ) : null}
            <ComboboxEmpty>{t("parentEmpty")}</ComboboxEmpty>
            {options.map((option) => (
              <ComboboxItem key={option.id} value={option.id}>
                <span className="inline-flex min-w-0 items-center gap-2">
                  <span className="truncate">{formatParentPath(option)}</span>
                  {!option.isActive ? (
                    <Badge className="shrink-0" variant="warning">
                      {t("inactive")}
                    </Badge>
                  ) : null}
                </span>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {categoriesQuery.isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {t("parentLoadError")}
        </p>
      ) : null}
      {selected && !selected.isActive ? (
        <Badge variant="warning">{t("parentInactive")}</Badge>
      ) : null}
    </div>
  );
}

function formatParentPath(category: CategoryParentOption) {
  return category.path.join(" / ");
}
