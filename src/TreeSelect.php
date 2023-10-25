<?php

namespace Jshxl\TreeSelect;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Http\Requests\NovaRequest;

class TreeSelect extends Field
{
    /**
     * The field's component.
     *
     * @var string
     */
    public $component = 'tree-select';

    /**
     * 数值转为整型
     *
     * @var bool
     * */
    public bool $formatInt = false;

    /**
     * 是否为多对多关联
     *
     * @var bool
     * */
    public bool $belongsToMany = false;

    /**
     * 数据源配置
     *
     * @var string|array
     * */
    public string|array $options;

    /**
     * 名称前拼接编码
     *
     * @var bool
     * */
    public bool $nameWithCode = false;

    /**
     * table显示的字段
     *
     * @var array
     * */
    public array $columns = [];

    /**
     * option默认请求方式
     *
     * @var string
     * */
    public string $method = 'get';

    /**
     * 最大层级
     *
     * @var int
     * */
    public int $maxLevel = 0;

    /**
     * 数值转为整型
     * @param bool $boolean
     *
     * @return self
     * */
    public function formatInt(bool $boolean = true): self
    {
        $this->formatInt = $boolean;
        return $this;
    }

    /**
     * 数据源配置
     * @param string|array $options
     *
     * @return self
     * */
    public function options(string|array $options = []): self
    {
        $this->options = $options;
        return $this;
    }

    /**
     * 是否为多对多关联
     * @param bool $boolean
     *
     * @return self
     * */
    public function belongsToMany(bool $boolean = true): self
    {
        $this->belongsToMany = $boolean;
        return $this;
    }

    /**
     * 名称前拼接编码
     * @param bool $boolean
     *
     * @return self
     * */
    public function nameWithCode(bool $boolean = true): self
    {
        $this->nameWithCode = $boolean;
        return $this;
    }

    /**
     * table显示的字段
     * @param array $columns
     *
     * @return self
     * */
    public function columns(array $columns): self
    {
        $this->columns = $columns;
        return $this;
    }

    /**
     * 默认请求方式
     * @param string $method
     *
     * @return self
     * */
    public function method(string $method = 'post'): self
    {
        $method = strtolower($method);
        $this->method = in_array($method, ['get', 'post']) ? $method : 'get';
        return $this;
    }

    /**
     * 最大层级
     * @param int $int
     *
     * @return self
     * */
    public function maxLevel(int $int = 0): self
    {
        $this->maxLevel = $int;
        return $this;
    }

    /**
     * Hydrate the given attribute on the model based on the incoming request.
     * @param NovaRequest $request
     * @param string $requestAttribute
     * @param Model $model
     * @param string $attribute
     *
     * @return Closure|void
     */
    protected function fillAttributeFromRequest(NovaRequest $request, $requestAttribute, $model, $attribute)
    {
        if (!$request->exists($requestAttribute)) return;

        $value = collect(json_decode($request->input($requestAttribute), true))
            ->map(function ($item) {
                return $this->formatInt ? intval($item) : $item;
            })
            ->all();
        if (!$this->belongsToMany) {
            $model->forceFill([Str::replace('.', '->', $attribute) => $value]);
            return;
        }

        return function () use ($model, $attribute, $value) {
            $model->{$attribute}()->sync($value);
        };
    }

    /**
     * Prepare the field for JSON serialization.
     *
     * @return array<string, mixed>
     * @throws \Exception
     */
    public function jsonSerialize(): array
    {
        if (!isset($this->options)) {
            throw new \Exception(__('TreeSelect\'s option is required'));
        }

        return with(app(NovaRequest::class), function ($request) {
            return array_merge([
                'options'      => $this->options,
                'columns'      => $this->columns,
                'formatInt'    => $this->formatInt,
                'nameWithCode' => $this->nameWithCode,
                'maxLevel'     => $this->maxLevel,
                'method'       => $this->method,
            ], parent::jsonSerialize());
        });
    }
}
