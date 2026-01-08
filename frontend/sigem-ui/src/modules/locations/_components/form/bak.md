 <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
          <SectionHeader
            icon={Layers}
            title="Hierarchy Level"
            description="Define the organizational level for this location"
          />

          <FormFieldWrapper
            label="Location Level"
            error={errors.level?.message as string | undefined}
            tooltip="Select the hierarchical level of this location"
          >
            <Select
              value={level}
              onValueChange={(val) => setValue("level", val)}
            >
              <SelectTrigger
                className={`h-12 border-2 transition-all ${
                  currentLevelConfig
                    ? `${currentLevelConfig.borderColor} ${currentLevelConfig.bgColor}`
                    : "border-muted-foreground/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  {currentLevelConfig && (
                    <>
                      <currentLevelConfig.icon
                        className={`h-4 w-4 ${currentLevelConfig.color}`}
                      />
                      <span className={currentLevelConfig.color}>
                        {currentLevelConfig.label}
                      </span>
                    </>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(levelConfig).map(([key, config]) => {
                  const LevelIcon = config.icon;
                  return (
                    <SelectItem
                      key={key}
                      value={key}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor} border ${config.borderColor}`}
                        >
                          <LevelIcon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          {/* Level indicator badge */}
          {currentLevelConfig && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4"
            >
              <Badge
                variant="outline"
                className={`${currentLevelConfig.bgColor} ${currentLevelConfig.borderColor} ${currentLevelConfig.color} border-2`}
              >
                <currentLevelConfig.icon className="h-3 w-3 mr-1.5" />
                {currentLevelConfig.description}
              </Badge>
            </motion.div>
          )}
        </div>
